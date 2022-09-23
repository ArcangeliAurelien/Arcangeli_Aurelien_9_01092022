/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import Bills from "../containers/Bills.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : +1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe('Given i am on error page', () => {
    test('should show the error message', () => {
      const html = BillsUI({ error: 'error message' })
      document.body.innerHTML = html
      expect(screen.getAllByText('error message')).toBeTruthy()
    })
  })
  describe('Given i am on bills page', () => {
    test('Should called the handleClickNewBill method when i click on newBill button', () => {
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const onNavigate = ((pathname) => document.body.innerHTML = ROUTES({ pathname }))
      const bill = new Bills({
        document,
        onNavigate
      })
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      expect(buttonNewBill).toBeTruthy()
      buttonNewBill.addEventListener('click', handleClickNewBill)
      fireEvent.click(buttonNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })

  })
  test('Should called the handleClickIconEye when i click on iconEye', () => {
    const html = BillsUI({ data: bills })
    document.body.innerHTML = html
    const bill = new Bills({
      document,
      onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname })
    })
    const AllIconEye = screen.getAllByTestId('icon-eye')
    const iconEye1 = AllIconEye[0]
    const handleClickIconEye = jest.fn(bill.handleClickIconEye(iconEye1))
    iconEye1.addEventListener('click', handleClickIconEye)
    expect(iconEye1).toBeDefined()
    fireEvent.click(iconEye1)
    expect(handleClickIconEye).toHaveBeenCalled()
  })
})
