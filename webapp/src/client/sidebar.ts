import {SidebarGroup} from "../types/sidebar";

import {Rest} from "./rest";

export class SidebarClient{
    rest: Rest;

    constructor (rest: Rest){
        this.rest = rest;
    }



    getMyCategoriesRoute() {
        return `${this.rest.getBaseRoute()}/my_categories`;
    }

    getMyCategoryRoute(categoryID: string) {
        return `${this.getMyCategoriesRoute()}/${categoryID}`;
    }

    setMyCategoryCollapsed = async (categoryID: string, collapsed: boolean) => {
        try {
            return await this.rest.doPut(`${this.getMyCategoryRoute(categoryID)}/collapse`, collapsed);
        } catch (error) {
            return {error};
        }
    };

    getMyCategories = async () => {
        const data = this.rest.doFetch<Array<SidebarGroup>>(`${this.getMyCategoriesRoute()}`, {method: 'get'});
        return data;
    };
}
