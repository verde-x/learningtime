import { useState, useEffect, type FC, type ChangeEvent } from "react";
import { Button, Dialog, Field, Input, CloseButton } from "@chakra-ui/react";
import type { StudyRecord } from "../../types/studyRecord";

type EditStudyProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; time: number }) => Promise<void>;
  initialData?: StudyRecord;
  header: string;
};

export const EditStudy: FC<EditStudyProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  header,
}) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(initialData?.title ?? "");
      setTime(initialData?.time.toString() ?? "");
    }
  }, [open, initialData]);

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const onChangeTime = (e: ChangeEvent<HTMLInputElement>) =>
    setTime(e.target.value);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("学習内容の入力は必須です");
      return;
    }
    if (!time.trim()) {
      alert("学習時間の入力は必須です");
      return;
    }
    const timeNumber = Number(time);
    if (isNaN(timeNumber)) {
      alert("学習時間には数字を入力してください");
      return;
    }
    if (timeNumber <= 0) {
      alert("学習時間は0以上である必要があります");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ title, time: timeNumber });
      onClose();
    } catch {
      alert("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onClose}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger />
            <Dialog.Header>
              <Dialog.Title>{header}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root>
                <Field.Label>学習内容</Field.Label>
                <Input value={title} onChange={onChangeTitle} />
              </Field.Root>
              <Field.Root>
                <Field.Label>学習時間</Field.Label>
                <Input value={time} onChange={onChangeTime} />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button
                size="sm"
                colorPalette="blue"
                variant="solid"
                onClick={handleSubmit}
                loading={loading}
              >
                登録
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
};
