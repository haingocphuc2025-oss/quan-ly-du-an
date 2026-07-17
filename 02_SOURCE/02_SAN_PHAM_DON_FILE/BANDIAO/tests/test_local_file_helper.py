import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import local_file_helper


class ResolveAttachmentPathTests(unittest.TestCase):
    def test_keeps_existing_file_inside_current_root(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir).resolve()
            attachment = root / "current.pdf"
            attachment.write_bytes(b"pdf")

            with patch.object(local_file_helper, "ROOT", root):
                self.assertEqual(local_file_helper.resolve_attachment_path(str(attachment)), attachment)

    def test_rebases_stale_absolute_path_to_current_root_by_filename(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir).resolve()
            attachment = root / "3.1 LIST.pdf"
            attachment.write_bytes(b"pdf")

            with patch.object(local_file_helper, "ROOT", root):
                resolved = local_file_helper.resolve_attachment_path(
                    r"E:\My Drive\old-project\_LOCAL_ATTACHMENTS\3.1 LIST.pdf"
                )

            self.assertEqual(resolved, attachment)

    def test_rejects_missing_external_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir).resolve()
            with patch.object(local_file_helper, "ROOT", root):
                self.assertIsNone(
                    local_file_helper.resolve_attachment_path(r"E:\outside\missing.pdf")
                )

    def test_rejects_empty_target_and_directories(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir).resolve()
            with patch.object(local_file_helper, "ROOT", root):
                self.assertIsNone(local_file_helper.resolve_attachment_path(""))
                self.assertIsNone(local_file_helper.resolve_attachment_path(str(root)))

    def test_rejects_malformed_path_without_raising(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir).resolve()
            with patch.object(local_file_helper, "ROOT", root):
                self.assertIsNone(local_file_helper.resolve_attachment_path("C:\\bad\x00name.pdf"))


class ProjectSaveConflictTests(unittest.TestCase):
    def project_paths(self, temp_dir):
        root = Path(temp_dir).resolve()
        return root, root / "qlda_project_backup.json"

    def test_rejects_stale_other_session_without_overwriting_current_data(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root, project_file = self.project_paths(temp_dir)
            with patch.object(local_file_helper, "PROJECT_ROOT", root), patch.object(local_file_helper, "PROJECT_FILE", project_file):
                status, first = local_file_helper.save_project_payload({
                    "projects": [{"name": "new"}], "folders": [[]],
                    "_storageMeta": {"baseRevision": 0, "sessionId": "session-a", "sessionSequence": 1},
                })
                status_stale, stale = local_file_helper.save_project_payload({
                    "projects": [{"name": "stale"}], "folders": [[]],
                    "_storageMeta": {"baseRevision": 0, "sessionId": "session-b", "sessionSequence": 1},
                })
                self.assertEqual(status, 200)
                self.assertEqual(first["revision"], 1)
                self.assertEqual(status_stale, 409)
                self.assertTrue(stale["conflict"])
                saved = json.loads(project_file.read_text(encoding="utf-8"))
                self.assertEqual(saved["projects"][0]["name"], "new")

    def test_accepts_newer_sequence_from_same_session_with_old_base_revision(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root, project_file = self.project_paths(temp_dir)
            with patch.object(local_file_helper, "PROJECT_ROOT", root), patch.object(local_file_helper, "PROJECT_FILE", project_file):
                local_file_helper.save_project_payload({
                    "projects": [{"name": "one"}], "folders": [[]],
                    "_storageMeta": {"baseRevision": 0, "sessionId": "session-a", "sessionSequence": 1},
                })
                status, result = local_file_helper.save_project_payload({
                    "projects": [{"name": "two"}], "folders": [[]],
                    "_storageMeta": {"baseRevision": 0, "sessionId": "session-a", "sessionSequence": 2},
                })
                self.assertEqual(status, 200)
                self.assertEqual(result["revision"], 2)
                saved = json.loads(project_file.read_text(encoding="utf-8"))
                self.assertEqual(saved["projects"][0]["name"], "two")
                self.assertTrue(project_file.with_suffix(".json.bak").exists())

    def test_ignores_out_of_order_request_from_same_session(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root, project_file = self.project_paths(temp_dir)
            with patch.object(local_file_helper, "PROJECT_ROOT", root), patch.object(local_file_helper, "PROJECT_FILE", project_file):
                local_file_helper.save_project_payload({
                    "projects": [{"name": "newest"}], "folders": [[]],
                    "_storageMeta": {"baseRevision": 0, "sessionId": "session-a", "sessionSequence": 2},
                })
                status, result = local_file_helper.save_project_payload({
                    "projects": [{"name": "older"}], "folders": [[]],
                    "_storageMeta": {"baseRevision": 0, "sessionId": "session-a", "sessionSequence": 1},
                })
                self.assertEqual(status, 200)
                self.assertTrue(result["duplicate"])
                saved = json.loads(project_file.read_text(encoding="utf-8"))
                self.assertEqual(saved["projects"][0]["name"], "newest")


if __name__ == "__main__":
    unittest.main()
