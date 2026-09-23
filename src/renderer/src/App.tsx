const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/scenes',
        element: <Scenes />
      },
      {
        path: '/information',
        element: <Information />
      }
    ]
  }
])

import Layout from '@components/Layout'
import Home from '@pages/Home'
import Information from '@pages/Information'
import Scenes from '@pages/Scenes'
import { ReactNode } from 'react'
import { createHashRouter, RouterProvider } from 'react-router'

function App(): ReactNode {
  return <RouterProvider router={router} />
}

export default App
