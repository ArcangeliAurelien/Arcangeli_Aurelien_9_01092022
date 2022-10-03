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
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    //récupère les factures à partir de l'API GET fictive
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() =>
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      );
    });
    // Vérifie lorsqu'une erreur se produit sur l'API
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      //récupère des factures à partir d'une API et échoue avec un message d'erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => new Promise(process.nextTick));
        const message = await waitFor(() => screen.getByText(/Erreur 404/));
        expect(message).toBeTruthy();
      });
      //récupère les messages à partir d'une API et échoue avec une erreur de message 500
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await waitFor(() => new Promise(process.nextTick));
        const message = await waitFor(() => screen.getByText(/Erreur 500/));
        expect(message).toBeTruthy();
      });
    });
  });
});
describe("When I click on Nouvelle note de frais", () => {
  // Vérifie l'apparation du formulaire de création de bills 
  test("Then the form to create a new bill appear", async () => {
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }
    Object.defineProperty(window, "localStorage", { value: localStorageMock })
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }))
    const initNewbill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
    })
    document.body.innerHTML = BillsUI({ bills })
    const handleClickNewBill = jest.fn(initNewbill.handleClickNewBill)
    const btnNewBill = screen.getByTestId("btn-new-bill")
    btnNewBill.addEventListener('click', handleClickNewBill)
    userEvent.click(btnNewBill)
    expect(handleClickNewBill).toHaveBeenCalled()
    expect(screen.getByTestId("form-new-bill")).toBeTruthy()
  })
})