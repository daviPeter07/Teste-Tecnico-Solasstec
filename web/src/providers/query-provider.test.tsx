// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import { QueryProvider } from "./query-provider";

function QueryDefaults() {
  const defaults = useQueryClient().getDefaultOptions();

  return (
    <output>
      {JSON.stringify({
        staleTime: defaults.queries?.staleTime,
        retry: defaults.queries?.retry,
        refetchOnWindowFocus: defaults.queries?.refetchOnWindowFocus,
        mutationRetry: defaults.mutations?.retry,
      })}
    </output>
  );
}

describe("QueryProvider", () => {
  afterEach(cleanup);

  it("provides the application query defaults", () => {
    render(
      <QueryProvider>
        <QueryDefaults />
      </QueryProvider>,
    );

    expect(screen.getByText(/"staleTime":60000/).textContent).toContain(
      '"mutationRetry":false',
    );
  });
});
