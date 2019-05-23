export const updateUI = payload => ({
  type: 'UI_UPDATE',
  payload,
});

export const updateStepUI = ({ step, payload, rootPayload = {} }) => ({
  type: 'UI_STEP_UPDATE',
  step,
  payload,
  rootPayload,
});

export const changeEventCollection = payload => ({
  type: 'CHANGE_EVENT_COLLECTION',
  payload,
});

export const updateSavedQueryUI = payload => ({
  type: 'UPDATE_SAVED_QUERY_UI',
  payload,
});

export const resetSavedQueryUI = payload => ({
  type: 'RESET_SAVED_QUERY_UI',
  payload,
});

export const resetUI = () => ({
  type: 'RESET_UI',
});

export const addFilter = () => ({
  type: 'ADD_FILTER',
});

export const deleteFilter = payload => ({
  type: 'DELETE_FILTER',
  payload,
});

export const updateFilter = payload => ({
  type: 'UPDATE_FILTER',
  payload,
});

export const addStepFilter = ({ step, payload }) => ({
  type: 'ADD_STEP_FILTER',
  step,
  payload,
});

export const deleteStepFilter = ({ step, payload }) => ({
  type: 'DELETE_STEP_FILTER',
  step,
  payload,
});

export const updateStepFilter = ({ step, payload }) => ({
  type: 'UPDATE_STEP_FILTER',
  step,
  payload,
});

export const togglePanelSave = () => ({
  type: 'TOGGLE_PANEL_SAVE',
});

export const addStep = () => ({
  type: 'ADD_STEP',
});

export const deleteStep = payload => ({
  type: 'DELETE_STEP',
  payload,
});


