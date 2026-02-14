import { useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';

// Auth hooks
export const useAuth = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  return {
    ...auth,
    dispatch,
  };
};

// Cart hooks
export const useCart = () => {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  
  return {
    ...cart,
    dispatch,
  };
};

// Product hooks
export const useProducts = () => {
  const products = useSelector((state) => state.product);
  const dispatch = useDispatch();
  
  return {
    ...products,
    dispatch,
  };
};

// UI hooks
export const useUI = () => {
  const ui = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  
  return {
    ...ui,
    dispatch,
  };
};

// Location hooks
export const useLocation = () => {
  const location = useSelector((state) => state.location);
  const dispatch = useDispatch();
  
  return {
    ...location,
    dispatch,
  };
};
