export const showModal = ({id, modalProps = {}}) => (
  

   
    {
      type: 'MODAL__SET_ID',
      payload: id,
    }

    // dispatch({
    //   type: 'MODAL__SET_MODAL_PROPS',
    //   payload: modalProps,
    // });
  
)

export const hideModal = () => (
   {
      type: 'MODAL__SET_ID',
      payload: '',
    }

    // dispatch({
    //   type: 'MODAL__SET_MODAL_PROPS',
    //   payload: {},
    // });
)
