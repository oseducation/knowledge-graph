import {ReactNode} from "react";

export const InProgressNodesCategoryName = 'inProgressCategory';
export const NextNodesCategoryName = 'nextCategory';

export interface GroupItem {
    id: string;
    icon: string;
    itemMenu?: React.ReactNode;
    display_name: string;
    className: string;
    areaLabel: string;
    link: string;
    isCollapsed: boolean;
}

export interface SidebarGroup {
    id: string;
    display_name: string;
    collapsed: boolean;
    items: Array<GroupItem>;
    afterGroup?: ReactNode;
}
