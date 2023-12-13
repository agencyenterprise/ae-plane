// components
import { KanbanIssueBlock } from "components/issues";
import { IIssueDisplayProperties, IIssue } from "types";
import { EIssueActions } from "../types";
import { IIssueResponse } from "store_legacy/issues/types";

interface IssueBlocksListProps {
  sub_group_id: string;
  columnId: string;
  issues: IIssueResponse;
  issueIds: string[];
  isDragDisabled: boolean;
  showEmptyGroup: boolean;
  handleIssues: (issue: IIssue, action: EIssueActions) => void;
  quickActions: (issue: IIssue, customActionButton?: React.ReactElement) => React.ReactNode;
  displayProperties: IIssueDisplayProperties | null;
  canEditProperties: (projectId: string | undefined) => boolean;
}

export const KanbanIssueBlocksList: React.FC<IssueBlocksListProps> = (props) => {
  const {
    sub_group_id,
    columnId,
    issues,
    issueIds,
    showEmptyGroup,
    isDragDisabled,
    handleIssues,
    quickActions,
    displayProperties,
    canEditProperties,
  } = props;

  return (
    <>
      {issueIds && issueIds.length > 0 ? (
        <>
          {issueIds.map((issueId, index) => {
            if (!issues[issueId]) return null;

            const issue = issues[issueId];

            return (
              <KanbanIssueBlock
                key={`kanban-issue-block-${issue.id}`}
                index={index}
                issue={issue}
                showEmptyGroup={showEmptyGroup}
                handleIssues={handleIssues}
                quickActions={quickActions}
                displayProperties={displayProperties}
                columnId={columnId}
                sub_group_id={sub_group_id}
                isDragDisabled={isDragDisabled}
                canEditProperties={canEditProperties}
              />
            );
          })}
        </>
      ) : null}
    </>
  );
};
