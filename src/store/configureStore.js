import {createStore,applyMiddleware,compose} from "redux";
import rootReducer from "./reducers";
import thunk from "redux-thunk";

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const middleware = [thunk];

export default function configureStore() {
    return createStore(
        rootReducer,
        composeEnhancer(applyMiddleware(...middleware))
    )
}