export const SIDEBAR_OPEN = 'SIDEBAR_OPEN'
export const SIDEBAR_CLOSE = 'SIDEBAR_CLOSE'

type SidebarOpenAction = { type: typeof SIDEBAR_OPEN };
type SidebarCloseAction = { type: typeof SIDEBAR_CLOSE };

export type ProductsAction = SidebarOpenAction | SidebarCloseAction;
