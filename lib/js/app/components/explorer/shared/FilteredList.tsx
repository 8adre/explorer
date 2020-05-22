// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class FilteredList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: '',
    };
  }

  updateFilter(e) {
    this.setState({
      filter: e.target.value,
    });
  }

  render() {
    const { items, activeItem } = this.props;

    const { filter } = this.state;

    return (
      <div className="filtered-list">
        <input
          className="input-filter"
          placeholder="Search..."
          type="text"
          value={filter}
          onChange={(e) => this.updateFilter(e)}
        />
        {items
          .filter(
            (item) => item.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0
          )
          .sort((itemA, itemB) => {
            const a = itemA.name;
            const b = itemB.name;
            if (a.toLowerCase() < b.toLowerCase()) {
              return -1;
            }
            if (a.toLowerCase() > b.toLowerCase()) {
              return 1;
            }
            return 0;
          })
          .map(({ name, index }) => (
            <div
              key={name}
              className={`item ${activeItem === name && 'active'}`}
              onClick={() => {
                this.props.onClick(name);
              }}
              onKeyDown={() => {
                this.props.onClick(name);
              }}
              role="button"
              tabIndex={index}
            >
              {name}
            </div>
          ))}
      </div>
    );
  }
}

FilteredList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  activeItem: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default FilteredList;
