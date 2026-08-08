/**
 * Trợ lý AI cho panel bên phải (spec ai-panel-v27, client ở v50).
 *
 * Client gọi: google.script.run.aiChat(prompt, context)
 * Trả về: object đã parse, một trong hai dạng
 *   { type: 'answer', text: '...' }
 *   { type: 'edit', explain: '...', changes: [{ cell: 'E7', old: '...', new: '...' }] }
 *
 * CÀI KHOÁ API — làm một lần, KHÔNG viết khoá vào file này:
 *   Apps Script → Project Settings → Script Properties → Add script property
 *   Property: GEMINI_API_KEY
 *   Value:    <khoá API Gemini của bạn>
 * Khoá nằm ở phía server nên không bao giờ đi xuống trình duyệt (AC8).
 *
 * Manifest đã có sẵn scope script.external_request cần cho UrlFetchApp.
 */

const AI_PROPERTY_KEY = 'GEMINI_API_KEY';

// Đổi model tại đây nếu cần. Spec yêu cầu bản Flash cho tốc độ.
const AI_MODEL = 'gemini-2.0-flash';
const AI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';

// Apps Script giới hạn 6 phút/lần chạy; mỗi lượt chỉ gọi API đúng 1 lần, không lặp.
const AI_TIMEOUT_MS = 30000;

/**
 * Điểm vào duy nhất cho client.
 * Ném Error với thông điệp tiếng Việt để panel hiện thẳng cho người dùng.
 */
function aiChat(prompt, context) {
  const key = layKhoaAi_();
  const noiDung = dungPromptAi_(prompt, context);

  const res = UrlFetchApp.fetch(AI_ENDPOINT + AI_MODEL + ':generateContent?key=' + encodeURIComponent(key), {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: noiDung }] }],
      generationConfig: {
        temperature: 0.2,
        // Ép Gemini trả JSON thuần — đáng tin hơn nhiều so với chỉ dặn trong prompt.
        responseMimeType: 'application/json'
      }
    })
  });

  const code = res.getResponseCode();
  const body = res.getContentText();

  if (code === 429) throw new Error('Gemini đang quá tải hoặc hết hạn mức, thử lại sau.');
  if (code === 400 || code === 403) throw new Error('Khoá API Gemini không hợp lệ hoặc bị từ chối (HTTP ' + code + ').');
  if (code !== 200) throw new Error('Gemini trả về HTTP ' + code + '.');

  return docKetQuaAi_(body);
}

/* ===== Xác thực người gọi (v53) =====
   Web App phải deploy ở mức "Anyone" thì trình duyệt mới gọi được: gửi header
   Authorization sẽ kích hoạt CORS preflight mà Apps Script không trả lời được.
   Bù lại, token OAuth đi trong BODY và được xác thực ở đây — không ai dùng chùa
   được khoá Gemini dù biết URL.

   Hai Script Property tuỳ chọn:
     AI_EXPECTED_CLIENT_ID  — OAuth client ID của app; chặn token mượn từ app khác
     AI_ALLOWED_EMAILS      — danh sách email được phép, phân tách bằng dấu phẩy
   Bỏ trống cả hai = không kiểm (chỉ nên dùng khi thử nghiệm). */
const AI_PROP_CLIENT_ID = 'AI_EXPECTED_CLIENT_ID';
const AI_PROP_ALLOWED_EMAILS = 'AI_ALLOWED_EMAILS';

function xacThucNguoiGoiAi_(accessToken) {
  const props = PropertiesService.getScriptProperties();
  const clientIdMongDoi = String(props.getProperty(AI_PROP_CLIENT_ID) || '').trim();
  const dsEmail = String(props.getProperty(AI_PROP_ALLOWED_EMAILS) || '').trim();

  // Không bật kiểm tra nào thì bỏ qua — nhưng vẫn cảnh báo trong log.
  if (!clientIdMongDoi && !dsEmail) {
    console.warn('AI: chưa bật kiểm tra người gọi. Nên đặt ' + AI_PROP_CLIENT_ID + ' hoặc ' + AI_PROP_ALLOWED_EMAILS + '.');
    return '';
  }

  if (!accessToken) {
    throw new Error('Chưa đăng nhập Google. Bấm kết nối Drive trong app rồi thử lại.');
  }

  const res = UrlFetchApp.fetch(
    'https://oauth2.googleapis.com/tokeninfo?access_token=' + encodeURIComponent(accessToken),
    { muteHttpExceptions: true }
  );
  if (res.getResponseCode() !== 200) {
    throw new Error('Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Kết nối lại Drive rồi thử lại.');
  }

  let info;
  try { info = JSON.parse(res.getContentText()); }
  catch (e) { throw new Error('Không đọc được thông tin đăng nhập.'); }

  // Token phải do đúng app này phát hành.
  if (clientIdMongDoi && String(info.aud || '') !== clientIdMongDoi) {
    throw new Error('Token không thuộc ứng dụng này.');
  }

  const email = String(info.email || '').toLowerCase();

  if (dsEmail) {
    // Scope 'drive' đơn thuần không kèm email. Thiếu email mà đang bật allowlist
    // thì phải TỪ CHỐI, không được cho qua — và nói rõ cách khắc phục.
    if (!email) {
      throw new Error(
        'Không lấy được email từ phiên đăng nhập. Thêm scope userinfo.email vào ' +
        'DRIVE_DIRECT_SCOPE trong app rồi kết nối lại Drive.'
      );
    }
    const duocPhep = dsEmail.toLowerCase().split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s; });
    if (duocPhep.indexOf(email) < 0) {
      throw new Error('Tài khoản ' + email + ' không có quyền dùng trợ lý AI.');
    }
  }

  return email;
}

/**
 * Bọc aiChat cho đường Web App (doPost action 'aichat').
 * Client chạy cục bộ nên gọi bằng fetch, không dùng google.script.run.
 * Trả về đúng shape {ok, ...} mà callSheetFactoryPost_() đang chờ.
 */
function aiChatForWebApp(payload) {
  try {
    xacThucNguoiGoiAi_(payload && payload.accessToken);
    const data = aiChat(payload && payload.prompt, payload && payload.context);
    return { ok: true, data: data };
  } catch (err) {
    return { ok: false, error: err && err.message ? err.message : String(err) };
  }
}

/** Lấy khoá từ Script Properties; báo rõ nếu chưa cài. */
function layKhoaAi_() {
  const key = PropertiesService.getScriptProperties().getProperty(AI_PROPERTY_KEY);
  if (!key) {
    throw new Error(
      'Chưa cài khoá API. Vào Project Settings → Script Properties, thêm ' +
      AI_PROPERTY_KEY + ' rồi thử lại.'
    );
  }
  return key;
}

/** Dựng prompt kèm ngữ cảnh sheet và ràng buộc định dạng trả về. */
function dungPromptAi_(prompt, context) {
  const c = context || {};
  const cot = (c.cot || []).map(function (x) {
    return '- ' + x.ten + ' (kiểu: ' + (x.kieu || 'text') + ')';
  }).join('\n');

  const dong = (c.duLieu || []).map(function (d) {
    return d.o + ' → ' + JSON.stringify(d.giaTri);
  }).join('\n');

  const canhBao = c.biCatBot
    ? '\nLƯU Ý: chỉ có ' + c.soDongGui + '/' + c.tongDongVung + ' dòng đầu được gửi.'
    : '';

  return [
    'Bạn là trợ lý dữ liệu cho một ứng dụng quản lý hồ sơ dự án xây dựng.',
    'Trả lời bằng tiếng Việt.',
    '',
    'SHEET: ' + (c.tenSheet || '(không rõ)'),
    c.vungChon ? 'VÙNG ĐANG CHỌN: ' + c.vungChon : 'PHẠM VI: toàn bộ sheet',
    'TỔNG SỐ DÒNG SHEET: ' + (c.tongDongSheet != null ? c.tongDongSheet : '?'),
    '',
    'CÁC CỘT:',
    cot || '(không có)',
    '',
    'DỮ LIỆU (ô đầu dòng → mảng giá trị theo thứ tự cột trên):',
    dong || '(trống)',
    canhBao,
    '',
    'YÊU CẦU CỦA NGƯỜI DÙNG:',
    String(prompt || ''),
    '',
    'CÁCH TRẢ LỜI — chỉ trả về JSON, không kèm giải thích ngoài JSON:',
    '- Nếu chỉ là câu hỏi, không cần sửa gì:',
    '  {"type":"answer","text":"..."}',
    '- Nếu cần sửa dữ liệu:',
    '  {"type":"edit","explain":"tóm tắt ngắn","changes":[{"cell":"E7","old":"giá trị cũ","new":"giá trị mới"}]}',
    '',
    'QUY TẮC:',
    '- "cell" phải là địa chỉ kiểu A1 (chữ cột + số dòng), lấy đúng theo dữ liệu ở trên.',
    '- Chỉ đưa vào "changes" những ô thực sự đổi giá trị.',
    '- Không bịa ô hay dòng không có trong dữ liệu được gửi.',
    '- Nếu không đủ thông tin để sửa, hãy dùng type "answer" để hỏi lại.'
  ].join('\n');
}

/** Bóc JSON từ phản hồi Gemini và kiểm tra đúng hợp đồng dữ liệu. */
function docKetQuaAi_(body) {
  let goi;
  try {
    goi = JSON.parse(body);
  } catch (e) {
    throw new Error('Không đọc được phản hồi từ Gemini.');
  }

  const chan = goi && goi.promptFeedback && goi.promptFeedback.blockReason;
  if (chan) throw new Error('Gemini từ chối xử lý yêu cầu này (' + chan + ').');

  const text = goi
    && goi.candidates
    && goi.candidates[0]
    && goi.candidates[0].content
    && goi.candidates[0].content.parts
    && goi.candidates[0].content.parts[0]
    && goi.candidates[0].content.parts[0].text;

  if (!text) throw new Error('Gemini không trả về nội dung.');

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // responseMimeType đã ép JSON, nhưng vẫn phòng trường hợp bị bọc trong ```json
    const sach = String(text).replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try {
      data = JSON.parse(sach);
    } catch (e2) {
      throw new Error('AI trả về dữ liệu không hợp lệ, vui lòng thử lại');
    }
  }

  if (!data || typeof data !== 'object') {
    throw new Error('AI trả về dữ liệu không hợp lệ, vui lòng thử lại');
  }

  if (data.type === 'answer' && typeof data.text === 'string') {
    return { type: 'answer', text: data.text };
  }

  if (data.type === 'edit' && Array.isArray(data.changes)) {
    const changes = data.changes.filter(function (x) {
      return x && typeof x.cell === 'string' && /^[A-Za-z]+\d+$/.test(x.cell.trim());
    }).map(function (x) {
      return {
        cell: String(x.cell).trim().toUpperCase(),
        old: x.old == null ? '' : String(x.old),
        new: x.new == null ? '' : String(x.new)
      };
    });
    if (!changes.length) throw new Error('AI trả về dữ liệu không hợp lệ, vui lòng thử lại');
    return { type: 'edit', explain: String(data.explain || ''), changes: changes };
  }

  throw new Error('AI trả về dữ liệu không hợp lệ, vui lòng thử lại');
}

/**
 * Chạy tay trong trình soạn Apps Script để kiểm tra cấu hình.
 * Không in khoá ra log.
 */
function kiemTraCauHinhAi() {
  const props = PropertiesService.getScriptProperties();
  const key = props.getProperty(AI_PROPERTY_KEY);
  if (!key) {
    Logger.log('CHƯA cài %s trong Script Properties.', AI_PROPERTY_KEY);
    return false;
  }
  Logger.log('Đã có %s (độ dài %s ký tự). Model: %s', AI_PROPERTY_KEY, key.length, AI_MODEL);
  try {
    const r = aiChat('Trả lời đúng một từ: OK', { tenSheet: 'test', cot: [], duLieu: [] });
    Logger.log('Gọi thử thành công: %s', JSON.stringify(r));
    return true;
  } catch (e) {
    Logger.log('Gọi thử thất bại: %s', e.message);
    return false;
  }
}
