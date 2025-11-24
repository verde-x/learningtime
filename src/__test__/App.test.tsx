import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { expect, test, vi, beforeEach, describe } from "vitest";
import "@testing-library/jest-dom";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

// テスト対象の指定
import App from "../App";

// モック関数を外部で定義
const mockAddRecord = vi.fn();
const mockUpdateRecord = vi.fn();
const mockDeleteRecord = vi.fn();

// alert をモック
const mockAlert = vi.fn();
window.alert = mockAlert;

// ローディング状態用のモック
let mockLoading = false;

// useStudyRecords をモック
vi.mock("../hooks/useStudyRecords", () => ({
  useStudyRecords: () => ({
    records: [
      { id: "1", title: "React", time: 2 },
      { id: "2", title: "TypeScript", time: 3 },
    ],
    get loading() {
      return mockLoading; // getter で動的に参照
    },
    addRecord: mockAddRecord,
    updateRecord: mockUpdateRecord,
    deleteRecord: mockDeleteRecord,
  }),
}));

// Chakra コンポーネントを Provider で囲むヘルパー
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

beforeEach(() => {
  vi.clearAllMocks();
  mockLoading = false;
});

describe("App コンポーネント", () => {
  // ローディング画面
  test("ローディング画面が表示される", () => {
    mockLoading = true;
    renderWithChakra(<App />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  // タイトル表示
  test("タイトルが表示される", () => {
    renderWithChakra(<App />);
    expect(screen.getByText("学習記録アプリ")).toBeInTheDocument();
  });

  // 合計時間表示
  test("合計時間が計算される", () => {
    renderWithChakra(<App />);
    expect(screen.getByText("5 時間")).toBeInTheDocument(); // 2 + 3 = 5
  });

  // テーブル表示
  test("テーブルが表示される", () => {
    renderWithChakra(<App />);
    expect(screen.getByText("学習内容")).toBeInTheDocument();
    expect(screen.getByText("学習時間")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  // 新規登録ボタン
  test("新規登録ボタンがある", () => {
    renderWithChakra(<App />);
    expect(screen.getByText("新規登録")).toBeInTheDocument();
  });
});

describe("新規登録機能", () => {
  // モーダルタイトル
  test("モーダルが新規登録というタイトルになっている", async () => {
    renderWithChakra(<App />);
    fireEvent.click(screen.getByRole("button", { name: "新規登録" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    // モーダル内の h2 タイトルを確認
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("新規登録");
  });

  // 学習記録の登録
  test("学習記録が登録できる", async () => {
    mockAddRecord.mockResolvedValue(undefined);
    renderWithChakra(<App />);

    fireEvent.click(screen.getByText("新規登録"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Vue" } });
    fireEvent.change(inputs[1], { target: { value: "5" } });

    fireEvent.click(screen.getByText("登録"));

    await waitFor(() => {
      expect(mockAddRecord).toHaveBeenCalledWith({
        title: "Vue",
        time: 5,
      });
    });
  });

  // 学習内容が空のエラー
  test("学習内容がないときに登録するとエラーが出る", async () => {
    renderWithChakra(<App />);
    fireEvent.click(screen.getByText("新規登録"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[1], { target: { value: "5" } });

    fireEvent.click(screen.getByText("登録"));

    expect(mockAlert).toHaveBeenCalledWith("学習内容の入力は必須です");
  });

  // 学習時間が空のエラー
  test("学習時間がないときに登録するとエラーが出る", async () => {
    renderWithChakra(<App />);
    fireEvent.click(screen.getByText("新規登録"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "React" } });

    fireEvent.click(screen.getByText("登録"));

    expect(mockAlert).toHaveBeenCalledWith("学習時間の入力は必須です");
  });

  // 0以下のエラー
  test("学習時間が0以下のときにエラーが出る", async () => {
    renderWithChakra(<App />);
    fireEvent.click(screen.getByText("新規登録"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "React" } });
    fireEvent.change(inputs[1], { target: { value: "0" } });

    fireEvent.click(screen.getByText("登録"));

    expect(mockAlert).toHaveBeenCalledWith(
      "学習時間は0以上である必要があります"
    );
  });
});

describe("編集機能", () => {
  test("学習記録が編集できる", async () => {
    mockUpdateRecord.mockResolvedValue(undefined);
    renderWithChakra(<App />);

    // 編集ボタンをクリック（1番目のレコード）
    const editButtons = screen.getAllByLabelText("編集");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // モーダルタイトルが「記録編集」であることを確認
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("記録編集");

    // 既存の値が入力欄に表示されていることを確認
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("React");
    expect(inputs[1]).toHaveValue("2");

    // 値を変更
    fireEvent.change(inputs[0], { target: { value: "React Updated" } });
    fireEvent.change(inputs[1], { target: { value: "10" } });

    // 登録ボタンをクリック
    fireEvent.click(screen.getByText("登録"));

    await waitFor(() => {
      expect(mockUpdateRecord).toHaveBeenCalledWith("1", {
        title: "React Updated",
        time: 10,
      });
    });
  });

  test("編集モーダルに既存データが表示される", async () => {
    renderWithChakra(<App />);

    const editButtons = screen.getAllByLabelText("編集");
    fireEvent.click(editButtons[1]); // 2番目（TypeScript）

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveValue("TypeScript");
    expect(inputs[1]).toHaveValue("3");
  });
});

describe("削除機能", () => {
  // 削除
  test("学習記録が削除できる", () => {
    renderWithChakra(<App />);

    const deleteButtons = screen.getAllByLabelText("削除");
    fireEvent.click(deleteButtons[0]);

    expect(mockDeleteRecord).toHaveBeenCalledWith("1");
  });
});
