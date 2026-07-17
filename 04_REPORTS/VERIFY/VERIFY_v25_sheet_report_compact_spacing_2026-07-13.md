# VERIFY v25 - Sheet Report compact wrap spacing

Ngay: 2026-07-13
Ket qua: PASS

## Noi dung da kiem

- Sheet wrap cell: padding top `2px`, padding left `5px`, line-height `16px`, white-space `pre-wrap`.
- Report wrap cell: padding left `4px`, line-height `16px`, white-space `pre-wrap`.
- Regression: quet 2x2 o Report va bam Delete van xoa dung 4 o.

## Ky thuat

- `node --check work\v25_inline.js`: PASS.
- 4 ban HTML v25 dong bo checksum: `16D2B49F03078C063DC87F0E36B3BB420B0E494329B27979F6EE4F708B9E065F`.
