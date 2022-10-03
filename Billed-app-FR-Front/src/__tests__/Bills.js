/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
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

// INTEGRER TEST GET

describe("Given I am an user connected as Employee", () => {
  describe("When I am on the Bills Page", () => {
    test("it should fetch bills from mock API GET", async () => {
      // On recréé le dom pour le test
      document.body.innerHTML = ""
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // On appelle le router
      router()
      // On précise sur quelle page on se trouve
      window.onNavigate(ROUTES_PATH.Bills)
      // On créé une promesse au prochain tick de l'API
      await new Promise(process.nextTick)
      // On recupère le tableau et toutes les bills qu'il contient
      const tableBills = screen.getByTestId('tbody')
      const arrayBills = tableBills.children

      // On doit avoir 4 bills
      expect(arrayBills.length).toBeGreaterThan(0)
      expect(arrayBills.length).toBe(4)
    })

    // Test des erreurs d'API
    describe("When an error occurs on API", () => {
      // Avant que le test commence
      beforeEach(() => {
        // On créé le dom, ainsi qu'un utilisateur de type Employee et on appelle le router
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      // erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              // Si erreur 404, la promesse est rejetée
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      // Erreur 500
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              // Si erreur 500, la promesse est rejetée
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })

      // Après le test, on vide le dom
      afterEach(() => {
        document.body.innerHTML = ''
      })
    })
  })
}) 