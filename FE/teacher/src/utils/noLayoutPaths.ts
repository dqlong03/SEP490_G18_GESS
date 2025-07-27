export enum NoLayoutPaths {
  // Authentication paths
  LOGIN = "/common/login",
  FORGOT_PASSWORD = "/common/forgotpass",

  // Error pages
  NOT_FOUND = "/404",
  SERVER_ERROR = "/500",

  // Other standalone pages that don't need header/footer
  PREVIEW_EXAM = "/examination/preview",
  TAKE_EXAM = "/examination/take",
}

export function isLayoutPage(path: string): boolean {
  return Object.values(NoLayoutPaths).some((authPath) =>
    path.startsWith(authPath)
  );
}
