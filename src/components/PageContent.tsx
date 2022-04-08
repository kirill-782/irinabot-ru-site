import { Route, Routes } from "react-router-dom";
import GameListPage from "./Pages/GameListPage";

function PageContent() {
    return ( 
        <div style={{marginTop:50}}>
            <Routes>
                <Route path="/" element = {<GameListPage />} />
            </Routes>
        </div>
     );
}

export default PageContent;