import {ReactNode} from "react";

export const InProgressNodesCategoryName = 'inProgressCategory';
export const NextNodesCategoryName = 'nextCategory';

export interface GroupItem {
    id: string;
    display_name: string;
    areaLabel: string;
    link: string;
}

export interface SidebarGroup {
    id: string;
    display_name: string;
    collapsed: boolean;
    items: Array<GroupItem>;
    afterGroup?: ReactNode;
}
