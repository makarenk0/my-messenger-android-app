import {combineReducers} from 'redux';
import {configureStore} from '@reduxjs/toolkit';
import {ModalReducer} from './modules/Modal/ModalReducer';

export default configureStore({
  reducer: combineReducers({
    modal: ModalReducer,
  }),
});
