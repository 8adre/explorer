// @ts-nocheck
import React, { Component, Fragment } from 'react';
import Select from 'react-select';
import moment from 'moment';
import { connect } from 'react-redux';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import TimePicker from 'rc-time-picker';

import { getThemeForSelect } from '../../utils/style';

import { updateUI, updateStepUI } from '../../redux/actionCreators/ui';

import {
  RELATIVITY_UNITS,
  TIME_UNITS,
  DEFAULT_TIMEFRAME_RELATIVE_VALUE,
  DEFAULT_TIMEFRAME_ABSOLUTE_VALUE,
  TAB_TIMEFRAME_RELATIVE,
  TAB_TIMEFRAME_ABSOLUTE,
  TIMEZONES,
} from '../../consts';

const mapStateToProps = (state) => ({
  timeframe: state.ui.timeframe,
  timezone: state.ui.timezone,
  steps: state.ui.steps,
});

const mapDispatchToProps = {
  updateUI,
  updateStepUI,
};

const convertDateToString = (valueSelected, timezone) => {
  const value = valueSelected || moment(moment().format('YYYY-MM-DD'));
  // const valueConverted = `${value.format('YYYY-MM-DD')}T${value.format(
  //   'HH:mm'
  // )}:00.000Z`;
  // return valueConverted;
  return moment(value).tz(timezone).format();
};

const timezoneByValue = (timezone) =>
  TIMEZONES.find((item) => item.value === timezone);
const timezoneToString = (timezone) =>
  (timezoneByValue(timezone) && timezoneByValue(timezone).label) || 'UTC';

class Timeframe extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderRelative() {
    let { timeframe = DEFAULT_TIMEFRAME_RELATIVE_VALUE } = this.props;
    const { steps, funnel, step, updateUI, updateStepUI } = this.props;

    // if (typeof timeframe === 'object') return;

    if (funnel) {
      timeframe = steps[step].timeframe;
    }

    const splits = timeframe.split('_');
    let timeframeUnits = splits[2];

    let defaultRelativity;
    let defaultUnit;

    if (splits.length === 1) {
      // support for timeframes like today
      if (timeframe === 'today') {
        defaultRelativity = 'this';
        defaultUnit = 1;
        timeframeUnits = 'days';
      }
      if (timeframe === 'yesterday' || timeframe === 'previous_day') {
        defaultRelativity = 'previous';
        defaultUnit = 1;
        timeframeUnits = 'days';
      }
      if (timeframe === 'previous_minute') {
        defaultRelativity = 'previous';
        defaultUnit = 1;
        timeframeUnits = 'minutes';
      }
      if (timeframe === 'previous_hour') {
        defaultRelativity = 'previous';
        defaultUnit = 1;
        timeframeUnits = 'hours';
      }
      if (timeframe === 'previous_week') {
        defaultRelativity = 'previous';
        defaultUnit = 1;
        timeframeUnits = 'weeks';
      }
      if (timeframe === 'previous_month') {
        defaultRelativity = 'previous';
        defaultUnit = 1;
        timeframeUnits = 'months';
      }
      if (timeframe === 'previous_year') {
        defaultRelativity = 'previous';
        defaultUnit = 1;
        timeframeUnits = 'years';
      }
    }

    if (splits.length === 2) {
      // support for timeframes like this_day, this_month
      defaultUnit = 1;
      timeframeUnits = `${timeframeUnits}s`;
    }

    const relativity = defaultRelativity || splits[0];
    const numberOfUnits = defaultUnit || splits[1];
    const units = timeframeUnits;

    const description = `The last
      ${numberOfUnits}
      ${units}
      ${relativity === 'this' ? 'including' : 'excluding'}
      the current day`;

    const update = (payload) => {
      if (funnel) {
        updateStepUI({
          step,
          payload,
        });
        return;
      }

      updateUI(payload);
    };

    return (
      <Fragment>
        <div className="relative">
          <Select
            value={{
              label: relativity,
              value: relativity,
            }}
            options={RELATIVITY_UNITS.map((item) => ({
              label: item,
              value: item,
            }))}
            onChange={(selectedRelativity) => {
              update({
                timeframe: `${selectedRelativity.value}_${numberOfUnits}_${units}`,
              });
            }}
            className="relativity"
            theme={getThemeForSelect}
          />
          <input
            type="number"
            value={numberOfUnits}
            onChange={(e) => {
              update({
                timeframe: `${relativity}_${e.target.value}_${units}`,
              });
            }}
            placeholder="Eg. 1"
            className="input-number"
          />
          <Select
            value={{
              label: units,
              value: units,
            }}
            options={TIME_UNITS.map((item) => ({ label: item, value: item }))}
            onChange={(selectedTimeUnits) => {
              update({
                timeframe: `${relativity}_${numberOfUnits}_${selectedTimeUnits.value}`,
              });
            }}
            className="units"
            theme={getThemeForSelect}
          />
        </div>
        <div className="description">{description}</div>
      </Fragment>
    );
  }

  renderAbsolute() {
    let { timeframe = DEFAULT_TIMEFRAME_ABSOLUTE_VALUE } = this.props;
    const {
      funnel,
      step,
      steps,
      updateUI,
      updateStepUI,
      timezone,
    } = this.props;
    const { startDateFocused, endDateFocused } = this.state;
    const falseFunc = () => false; // https://github.com/airbnb/react-dates/issues/239

    if (funnel) {
      timeframe = steps[step].timeframe;
    }

    const testDate = new Date(Date.UTC(2012, 11, 12, 3, 0, 0));
    const dateString = testDate.toLocaleTimeString();
    const use12HoursDateFormat =
      dateString.match(/am|pm/i) || testDate.toString().match(/am|pm/i);

    const startDate = moment.utc(timeframe.start);
    const endDate = moment.utc(timeframe.end);

    const update = (value) => {
      const payload = {
        timeframe: {
          ...timeframe,
          ...value,
        },
      };

      if (funnel) {
        updateStepUI({
          step,
          payload,
        });
        return;
      }

      updateUI(payload);
    };

    return (
      <div className="tabAbsolute">
        <div className="line">
          <div className="title">Start</div>
          <SingleDatePicker
            date={startDate}
            onDateChange={(valueSelected) => {
              if (!valueSelected) return;
              const valueSelectedWithTimeReset = moment
                .utc(valueSelected)
                .startOf('day');
              const valueConverted = convertDateToString(
                valueSelectedWithTimeReset,
                timezoneToString(timezone)
              );
              update({
                ...timeframe,
                start: valueConverted,
              });
            }}
            focused={startDateFocused}
            onFocusChange={({ focused }) =>
              this.setState({ startDateFocused: focused })
            }
            isOutsideRange={falseFunc}
            id="your_unique_id"
            numberOfMonths={1}
            displayFormat="YYYY-MM-DD"
          />
          <TimePicker
            use12Hours={use12HoursDateFormat}
            showSecond={false}
            value={startDate}
            onChange={(valueSelected) => {
              const valueConverted = convertDateToString(
                valueSelected,
                timezoneToString(timezone)
              );
              update({
                ...timeframe,
                start: valueConverted,
              });
            }}
          />
        </div>
        <div className="line">
          <div className="title">End</div>
          <SingleDatePicker
            date={endDate}
            onDateChange={(valueSelected) => {
              if (!valueSelected) return;
              const valueSelectedWithTimeReset = moment
                .utc(valueSelected)
                .startOf('day');
              const valueConverted = convertDateToString(
                valueSelectedWithTimeReset,
                timezoneToString(timezone)
              );
              update({
                ...timeframe,
                end: valueConverted,
              });
            }}
            focused={endDateFocused}
            onFocusChange={({ focused }) =>
              this.setState({ endDateFocused: focused })
            }
            isOutsideRange={falseFunc}
            id="your_unique_id2"
            numberOfMonths={1}
            displayFormat="YYYY-MM-DD"
          />
          <TimePicker
            use12Hours={use12HoursDateFormat}
            showSecond={false}
            value={endDate}
            onChange={(valueSelected) => {
              const valueConverted = convertDateToString(
                valueSelected,
                timezoneToString(timezone)
              );
              update({
                ...timeframe,
                end: valueConverted,
              });
            }}
          />
        </div>
      </div>
    );
  }

  render() {
    const {
      // props
      funnel,
      step,

      // redux state
      steps,

      // dispatchers
      updateUI,
      updateStepUI,
    } = this.props;

    let { timeframe, timezone, componentTimezone } = this.props;

    if (funnel) {
      timeframe = steps[step].timeframe;
      timezone = steps[step].timezone;
    }

    let timeframeActiveTab;

    if (typeof timeframe === 'string') {
      timeframeActiveTab = TAB_TIMEFRAME_RELATIVE;
    }

    if (typeof timeframe === 'object') {
      timeframeActiveTab = TAB_TIMEFRAME_ABSOLUTE;
    }

    const timezoneOption = (timezone !== 0 &&
      TIMEZONES.find((item) => item.value === timezone)) || {
      label: 'UTC',
      value: 0,
    };

    const sortedTimezones = TIMEZONES.sort((itemA, itemB) => {
      const a = itemA.label;
      const b = itemB.label;
      if (a.toLowerCase() < b.toLowerCase()) {
        return -1;
      }
      if (a.toLowerCase() > b.toLowerCase()) {
        return 1;
      }
      return 0;
    });

    return (
      <Fragment>
        <div className="timeframe">
          <div className="label-main">Timeframe</div>
          <div className="tabs">
            <div
              className={`tab ${
                timeframeActiveTab === TAB_TIMEFRAME_RELATIVE ? 'active' : ''
              }`}
              onClick={() => {
                if (funnel) {
                  updateStepUI({
                    step,
                    payload: {
                      timeframe: DEFAULT_TIMEFRAME_RELATIVE_VALUE,
                    },
                  });
                  return;
                }
                updateUI({
                  timeframe: DEFAULT_TIMEFRAME_RELATIVE_VALUE,
                });
              }}
            >
              Relative
            </div>
            <div
              className={`tab ${
                timeframeActiveTab === TAB_TIMEFRAME_ABSOLUTE ? 'active' : ''
              }`}
              onClick={() => {
                if (funnel) {
                  updateStepUI({
                    step,
                    payload: {
                      timeframe: { ...DEFAULT_TIMEFRAME_ABSOLUTE_VALUE },
                    },
                  });
                  return;
                }

                updateUI({
                  timeframe: {
                    ...DEFAULT_TIMEFRAME_ABSOLUTE_VALUE,
                  },
                });
              }}
            >
              Absolute
            </div>
          </div>
          <div className="tab-content">
            {timeframeActiveTab === TAB_TIMEFRAME_RELATIVE &&
              this.renderRelative()}
            {timeframeActiveTab === TAB_TIMEFRAME_ABSOLUTE &&
              this.renderAbsolute()}
          </div>
        </div>
        {componentTimezone && (
          <Select
            value={{
              label: `Timezone: ${timezoneOption.label}`,
              value: timezoneOption.value,
            }}
            options={sortedTimezones}
            onChange={(e) => {
              localStorage.setItem('timezone', e.value);
              const convertedTimezone = timezoneToString(timezone);
              if (timeframe.start && timeframe.end) {
                const startDate = moment(timeframe.start)
                  .tz(convertedTimezone)
                  .toString();
                const endDate = moment(timeframe.end)
                  .tz(convertedTimezone)
                  .toString();
                updateUI({
                  timeframe: {
                    start: startDate,
                    end: endDate,
                  },
                });
              }
              updateUI({
                timezone: e.value,
              });
              if (funnel) {
                updateStepUI({
                  step,
                  payload: {
                    timezone: e.value,
                    timeframe: {
                      start: moment(steps[step].timeframe.start)
                        .tz(convertedTimezone)
                        .toString(),
                      end: moment(steps[step].timeframe.end)
                        .tz(convertedTimezone)
                        .toString(),
                    },
                  },
                });
              }
            }}
            theme={getThemeForSelect}
          />
        )}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Timeframe);
