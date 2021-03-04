export const showModal = ({id}) => (
    {
      type: 'MODAL__SET_ID',
      payload: id,
    }
)

export const hideModal = () => (
    {
      type: 'MODAL__SET_ID',
      payload: '',
    }
)
