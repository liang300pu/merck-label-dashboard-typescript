// React imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

// Redux imports
import { Provider } from 'react-redux';
import { store } from './redux';

// Page imports
// import SamplesPage from './pages/SamplesPages/SamplesPage';
// import RootPage from './pages/RootPage/RootPage';
// import CreateSamplePage from './pages/CreateSamplePages/CreateSamplePage';
// import PSamplesPage from './pages/SamplesPages/PSamplesPage';
// import PCreateSamplePage from './pages/CreateSamplePages/PCreateSamplePage';
// import PrintersPage from './pages/PrintersPage/PrintersPage';
// import { DeletedSamplesPage } from './pages/DeletedSamplesPage/DeletedSamplesPage';
// import { LabelEditorPage } from './pages/LabelEditorPage/LabelEditorPage';

// MUI imports
import { createTheme, ThemeProvider } from '@mui/material/styles';

// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <RootPage />,
//     },
//     {
//         path: "/printers",
//         element: <PrintersPage />,
//     },
//     {
//         path: "/editor",
//         element: <LabelEditorPage />,
//     },
//     {
//         path: "/samples",
//         element: <SamplesPage />,
//     },

//     {
//         path: "/samples/create",
//         element: <CreateSamplePage />,
//     },
//     {
//         path: "samples/deleted",
//         element: <DeletedSamplesPage team={"ARND"} />,
//     },
//     {
//         path: "/samples/audit/:id",
//         element: <AuditTable team={"ARND"} />
//     },
//     {
//         path: "/psamples",
//         element: <PSamplesPage />,
//     },
//     {
//         path: "/psamples/create",
//         element: <PCreateSamplePage />,
//     },
//     {
//         path: "psamples/deleted",
//         element: <DeletedSamplesPage team={"PSCS"} />,
//     },
//     {
//         path: "/psamples/audit/:id",
//         element: <AuditTable team={"PSCS"} />
//     }
// ]);

import RootPage from "./pages/RootPage";
import EditTeamFieldsPage from "./pages/EditTeamFieldsPage";
import ViewSamplesPage from './pages/ViewSamplesPage';
import CreateSamplePage from './pages/CreateSamplePage';

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootPage />,
    },
    {
        path: "/fields",
        element: <EditTeamFieldsPage />
    },
    {
        path: "/samples",
        element: <ViewSamplesPage />,
    },
    {
        path: "/samples/create",
        element: <CreateSamplePage />,
    }
]);


const theme = createTheme({
    palette: {
        primary: {
            main: 'rgba(0, 133, 124, 1)'
        },
        secondary: {
            main: 'rgba(255, 255, 255, 1)'
        },
    },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <RouterProvider router={router} />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>
)
