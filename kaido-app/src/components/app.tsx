import { h } from "preact"
import { useContext, useReducer, useState } from "preact/hooks"
import { Container, Flex, ThemeProvider } from "theme-ui"

import { AppContext, SoftkeyReducer, SoftkeyContext, PopupContext, PopupContextProps } from "../contexts"
import GeneralRoutes from "../routes/general"
import Login from "../routes/login"
import Header from "./header"
// import SoftKey from "./softkey"
import { Softkey } from "./softkey"
import KaiUI from "../theme/kaiui"
import { PopupContainer } from "./popup"

const App: preact.FunctionalComponent = () => {
  const { auth, layoutTexts } = useContext(AppContext)
  const userIsLoggedIn = auth.getCurrentUser() != null
  const { header } = layoutTexts

  const [state, dispatch] = useReducer(SoftkeyReducer, {})
  const [popupState, setPopupState] = useState([] as any)

  return (
    <ThemeProvider theme={KaiUI}>
      <SoftkeyContext.Provider value={{ state, dispatch }}>
        <PopupContext.Provider value={{ popupState, setPopupState }}>
          <Flex id="layout" variant="kaiui.layout">
            <Header text={header} />
            <Container
              as="main"
              sx={{
                flex: `auto`,
                position: `relative`,
              }}
            >
              {userIsLoggedIn ? <GeneralRoutes /> : <Login />}
              <PopupContainer popups={popupState} />
            </Container>
            <Softkey {...state.current} />
          </Flex>
        </PopupContext.Provider>
      </SoftkeyContext.Provider>
    </ThemeProvider>
  )
}

export default App
