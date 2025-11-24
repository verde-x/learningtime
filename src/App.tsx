import { useState } from "react";
import { Heading, Flex, Button, IconButton, Table } from "@chakra-ui/react";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import "./App.css";

import { EditStudy } from "./components/study/EditStudy";
import { useStudyRecords } from "./hooks/useStudyRecords";
import type { StudyRecord, StudyInput } from "./types/studyRecord";

function App() {
  const { records, loading, addRecord, updateRecord, deleteRecord } =
    useStudyRecords();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudyRecord | null>(null);

  const handleUpdateRecord = async (data: StudyInput) => {
    if (!editingRecord) return;
    await updateRecord(editingRecord.id, data);
  };

  let totalTime = 0;
  records.forEach((record) => {
    totalTime += Number(record.time);
  });

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Heading mb={4} size="5xl">
        学習記録アプリ
      </Heading>
      <Flex justify="flex-end" align="center" gap={6}>
        <Flex>
          <p>合計</p>
          <p>{`${totalTime} 時間`}</p>
        </Flex>
        <Button
          size="sm"
          bg="blue.700"
          color="white"
          onClick={() => setIsAddOpen(true)}
        >
          新規登録
        </Button>
      </Flex>
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>学習内容</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">学習時間</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end"></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {records.map((record) => (
            <Table.Row key={record.id}>
              <Table.Cell>{record.title}</Table.Cell>
              <Table.Cell textAlign="center">{record.time}</Table.Cell>
              <Table.Cell textAlign="end">
                <IconButton
                  aria-label="編集"
                  size="xs"
                  bg="white"
                  color="gray.800"
                  onClick={() => {
                    setEditingRecord(record);
                    setIsEditOpen(true);
                  }}
                >
                  <LuPencil />
                </IconButton>
                <IconButton
                  aria-label="削除"
                  size="xs"
                  bg="white"
                  color="gray.800"
                  onClick={() => {
                    deleteRecord(record.id);
                  }}
                >
                  <LuTrash2 />
                </IconButton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <EditStudy
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={addRecord}
        header="新規登録"
      />

      <EditStudy
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdateRecord}
        initialData={editingRecord ?? undefined}
        header="記録編集"
      />
    </>
  );
}

export default App;
