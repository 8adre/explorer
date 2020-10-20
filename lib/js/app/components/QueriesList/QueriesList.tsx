import React, { FC, useCallback } from 'react';
import moment from 'moment';

import { QueriesTable, Header } from './QueriesList.styles';

import QueriesListItem from '../QueriesListItem';
import SortIndicators from '../SortIndicators';
import Heading from '../Heading';

import { SavedQueryListItem } from '../../modules/queries';
import text from './text.json';

import { QueriesSortSettings, SortProperty } from './types';

type Props = {
  /** Saved queries list */
  savedQueries: SavedQueryListItem[];
  /** Active query unique name */
  activeQuery: string;
  /** Select query event handler */
  onSelectQuery: (queryName: string, settings: Record<string, any>) => void;
  /** Queries sort settings */
  sortSettings: QueriesSortSettings;
  /** Update sort settings event handler */
  onSortQueries: (settings: QueriesSortSettings) => void;
};

const QueriesList: FC<Props> = ({
  savedQueries,
  activeQuery,
  sortSettings,
  onSortQueries,
  onSelectQuery,
}) => {
  const sortHandler = useCallback(
    (property: SortProperty) => {
      if (property !== sortSettings.property) {
        onSortQueries({ property, direction: 'ascending' });
      } else {
        const sortDirection =
          sortSettings.direction === 'ascending' ? 'descending' : 'ascending';
        onSortQueries({ property, direction: sortDirection });
      }
    },
    [sortSettings]
  );

  return (
    <QueriesTable>
      <tbody>
        <tr>
          <Header
            width="45%"
            paddingLeft={20}
            sortable
            onClick={() => sortHandler('name')}
            data-testid="table-header-name"
          >
            <Heading>{text.name}</Heading>
            <SortIndicators
              sortDirection={
                sortSettings.property === 'name' ? sortSettings.direction : null
              }
            />
          </Header>
          <Header width="35%" paddingLeft={10}>
            <Heading>{text.labels}</Heading>
          </Header>
          <Header
            width="20%"
            paddingLeft={10}
            paddingRight={20}
            sortable
            onClick={() => sortHandler('lastModifiedDate')}
            data-testid="table-header-date"
          >
            <Heading>{text.updated}</Heading>
            <SortIndicators
              sortDirection={
                sortSettings.property === 'lastModifiedDate'
                  ? sortSettings.direction
                  : null
              }
            />
          </Header>
        </tr>
        {savedQueries.map(
          ({
            name,
            displayName,
            lastModifiedDate,
            refreshRate,
            tags,
            query,
          }) => (
            <QueriesListItem
              key={name}
              queryName={displayName}
              tags={tags}
              isActive={activeQuery === name}
              refreshRate={refreshRate}
              updateDate={moment(lastModifiedDate).format('YYYY/MM/DD')}
              onClick={() => onSelectQuery(name, query)}
            />
          )
        )}
      </tbody>
    </QueriesTable>
  );
};

export default QueriesList;
