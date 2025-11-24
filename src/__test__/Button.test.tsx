import { render, screen, fireEvent } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import "@testing-library/jest-dom";

// テスト対象のコンポーネント
import { Button, ChakraProvider, defaultSystem } from "@chakra-ui/react";

// Chakra コンポーネントを Provider で囲むヘルパー
const renderWithChakra = (ui: React.ReactElement) => {
  return render(<ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>);
};

test("ボタンがレンダリングされる", () => {
  renderWithChakra(<Button>クリック</Button>);
  expect(screen.getByText("クリック")).toBeInTheDocument();
});

test("クリックイベントが発火する", () => {
  const handleClick = vi.fn();
  renderWithChakra(<Button onClick={handleClick}>クリック</Button>);

  fireEvent.click(screen.getByText("クリック"));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
