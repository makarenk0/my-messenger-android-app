  
import {combineReducers} from 'redux';

const INITIAL_STATE = {};


const modalReducer = (state = INITIAL_STATE, action) => {
    console.log(action)
    switch(action.type){
        case 'MODAL__SET_ID':
            console.log('MODAL__SET_ID')
            state['id'] = action.payload.id
            return state
        default:
            return state
    }
}
// export const modalProps = createReducer(MODAL_PROPS_INITIAL_STATE, {
//   ["MODAL__SET_MODAL_PROPS"](state, { payload }) {
//     return payload;
//   }
// });

// export const ModalReducer = combineReducers({
//   id,
//   modalProps
// });


export default combineReducers({
    modal: modalReducer,
});