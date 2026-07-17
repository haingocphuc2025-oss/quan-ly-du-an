# VERIFY v25 - Report wrap cells

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Tao report tam trong browser voi noi dung dai va row height 60.
- Cell Report co `white-space: pre-wrap`, `overflow-wrap: anywhere`, `text-overflow: clip`.
- Row height 60 duoc ap dung that: `--report-row-height: 60px`, cell cao 60px.
- Regression: quet 2x2 o Report va bam Delete van xoa dung 4 o.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `766D76727BFAF387FA1B9B4D0439868C5F670C72A71A1BFC19CB4096CDE80203`.
