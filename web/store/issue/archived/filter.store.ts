import { computed, makeObservable } from "mobx";
// base class
import { IssueFilterHelperStore } from "../helpers/issue-filter-helper.store";
// helpers
import { handleIssueQueryParamsByLayout } from "helpers/issue.helper";
// constants
import { isNil } from "constants/common";
import { EIssueFilterType } from "constants/issue";
// types
import { IssueRootStore } from "../root.store";
import { IIssueDisplayFilterOptions, IIssueDisplayProperties, IIssueFilterOptions, TIssueParams } from "types";

interface IProjectIssuesFilters {
  filters: IIssueFilterOptions | undefined;
  displayFilters: IIssueDisplayFilterOptions | undefined;
  displayProperties: IIssueDisplayProperties | undefined;
}

export interface IArchivedIssuesFilter {
  // computed
  issueFilters: IProjectIssuesFilters | undefined;
  appliedFilters: TIssueParams[] | undefined;
  // action
  fetchFilters: (workspaceSlug: string, projectId: string) => Promise<void>;
  updateFilters: (
    workspaceSlug: string,
    projectId: string,
    filterType: EIssueFilterType,
    filters: IIssueFilterOptions | IIssueDisplayFilterOptions | IIssueDisplayProperties
  ) => Promise<void>;
}

export class ArchivedIssuesFilter extends IssueFilterHelperStore implements IArchivedIssuesFilter {
  // root store
  rootStore;

  constructor(_rootStore: IssueRootStore) {
    super(_rootStore);

    makeObservable(this, {
      // computed
      issueFilters: computed,
      appliedFilters: computed,
    });

    // root store
    this.rootStore = _rootStore;
  }

  get issueFilters() {
    const projectId = this.rootStore.projectId;
    if (!projectId) return undefined;
    const displayFilters = this.rootStore.issuesFilter.issueDisplayFilters(projectId);

    const _filters: IProjectIssuesFilters = {
      filters: displayFilters?.filters,
      displayFilters: displayFilters?.displayFilters,
      displayProperties: displayFilters?.displayProperties,
    };

    return _filters;
  }

  get appliedFilters() {
    const userFilters = this.issueFilters;
    if (!userFilters) return undefined;

    let filteredRouteParams: any = {
      priority: userFilters?.filters?.priority || undefined,
      state_group: userFilters?.filters?.state_group || undefined,
      state: userFilters?.filters?.state || undefined,
      assignees: userFilters?.filters?.assignees || undefined,
      mentions: userFilters?.filters?.mentions || undefined,
      created_by: userFilters?.filters?.created_by || undefined,
      labels: userFilters?.filters?.labels || undefined,
      start_date: userFilters?.filters?.start_date || undefined,
      target_date: userFilters?.filters?.target_date || undefined,
      type: userFilters?.displayFilters?.type || undefined,
      sub_issue: isNil(userFilters?.displayFilters?.sub_issue) ? true : userFilters?.displayFilters?.sub_issue,
      show_empty_groups: isNil(userFilters?.displayFilters?.show_empty_groups)
        ? true
        : userFilters?.displayFilters?.show_empty_groups,
      start_target_date: isNil(userFilters?.displayFilters?.start_target_date)
        ? true
        : userFilters?.displayFilters?.start_target_date,
    };

    const filteredParams = handleIssueQueryParamsByLayout(userFilters?.displayFilters?.layout, "issues");
    if (filteredParams) filteredRouteParams = this.computedFilter(filteredRouteParams, filteredParams);

    return filteredRouteParams;
  }

  fetchFilters = async (workspaceSlug: string, projectId: string) => {
    try {
      await this.rootStore.issuesFilter.fetchDisplayFilters(workspaceSlug, projectId);
      await this.rootStore.issuesFilter.fetchDisplayProperties(workspaceSlug, projectId);
      return;
    } catch (error) {
      throw Error;
    }
  };

  updateFilters = async (
    workspaceSlug: string,
    projectId: string,
    filterType: EIssueFilterType,
    filters: IIssueFilterOptions | IIssueDisplayFilterOptions | IIssueDisplayProperties
  ) => {
    try {
      switch (filterType) {
        case EIssueFilterType.FILTERS:
          await this.rootStore.issuesFilter.updateDisplayFilters(
            workspaceSlug,
            projectId,
            filterType,
            filters as IIssueFilterOptions
          );
          break;
        case EIssueFilterType.DISPLAY_FILTERS:
          await this.rootStore.issuesFilter.updateDisplayFilters(
            workspaceSlug,
            projectId,
            filterType,
            filters as IIssueDisplayFilterOptions
          );
          break;
        case EIssueFilterType.DISPLAY_PROPERTIES:
          await this.rootStore.issuesFilter.updateDisplayProperties(
            workspaceSlug,
            projectId,
            filters as IIssueDisplayProperties
          );
          break;
      }

      return;
    } catch (error) {
      throw error;
    }
  };
}
