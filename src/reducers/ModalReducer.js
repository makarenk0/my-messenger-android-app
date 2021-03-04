import {combineReducers} from 'redux';
import {createReducer} from '@reduxjs/toolkit';

const ID_INITIAL_STATE = '';

const id = createReducer(ID_INITIAL_STATE, {
  
  ['MODAL__SET_ID'](state, {payload}) {
    return payload;
  },
});

const MODAL_PROPS_INITIAL_STATE = {};

const modalProps = createReducer(MODAL_PROPS_INITIAL_STATE, {
  ['MODAL__SET_MODAL_PROPS'](state, {payload}) {
    return payload;
  },
});

export const ModalReducer = combineReducers({
  id,
  modalProps,
});
