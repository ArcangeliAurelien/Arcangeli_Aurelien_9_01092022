/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)

Object.defineProperty(window, 'localStorage', { value: localStorageMock })
window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
}))
const root = document.createElement("div")
root.setAttribute("id", "root")
document.body.append(root)
router()
window.alert = jest.fn()

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the NewBill Page should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const title = screen.getAllByText('Envoyer une note de frais')
      const btnSend = screen.getAllByText('Envoyer')
      const form = document.querySelector('form')
      expect(title).toBeTruthy()
      expect(btnSend).toBeTruthy()
      expect(form.length).toEqual(9)
    })
    describe("When I upload an image file", () => {
      test("Then the file handler should display a file", () => {
        document.body.innerHTML = NewBillUI()
        const newBillClass = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        const btnFile = screen.getByTestId('file')
        const handleChangeFile = jest.fn(newBillClass.handleChangeFile)
        btnFile.addEventListener('change', handleChangeFile)
        fireEvent.change(btnFile, {
          target: {
            files: [new File(['content'], 'yourReceipt.png', { type: 'image/png' })],
          }
        })
        const fileNumber = btnFile.files.length

        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileNumber).toEqual(1)
        expect(btnFile.files[0].name).toBe('yourReceipt.png')
        expect(window.alert).not.toBeCalled()
        expect(btnFile.value).not.toBeNull()
      })
    })
  })
})
describe("When I upload a wrong type file - non-image file", () => {
  test("Then the window alert should be displayed", () => {
    document.body.innerHTML = NewBillUI()
    const newBillClass = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
    const btnFile = screen.getByTestId('file')
    const handleChangeFile = jest.fn(newBillClass.handleChangeFile)
    btnFile.addEventListener('change', handleChangeFile)
    fireEvent.change(btnFile, {
      target: {
        files: [new File(['content'], 'sample.pdf', { type: 'application/pdf' })],
      }
    })

    expect(handleChangeFile).toHaveBeenCalled()
    expect(btnFile.files[0].name).toBe('sample.pdf')
    expect(window.alert).toBeCalled()
    expect(btnFile.value).toBe('')
  })
})

// // INTEGRER TEST POST

// describe("Given I am connected as Employee on NewBill page, and submit the form", () => {
//   beforeEach(() => {
//     jest.spyOn(mockStore, "bills");

//     Object.defineProperty(window, "localStorage", {
//       value: localStorageMock,
//     });
//     window.localStorage.setItem(
//       "user",
//       JSON.stringify({
//         type: "Employee",
//         email: "a@a",
//       })
//     );
//     const root = document.createElement("div");
//     root.setAttribute("id", "root");
//     document.body.append(root);
//     router();
//   });

//   describe("when APi is working well", () => {
//     //alors je devrais être envoyé sur la page des factures avec les factures mises à jour
//     test("then i should be sent on bills page with bills updated", async () => {
//       const newBill = new NewBill({
//         document,
//         onNavigate,
//         store: mockStore,
//         localStorage: window.localStorageMock,
//       });

//       const form = screen.getByTestId("form-new-bill");
//       const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
//       form.addEventListener("submit", handleSubmit);

//       fireEvent.submit(form);

//       expect(handleSubmit).toHaveBeenCalled();
//       expect(screen.getByText("Mes notes de frais")).toBeTruthy();
//       expect(mockStore.bills).toHaveBeenCalled();
//     });

//     describe("When an error occurs on API", () => {
//       //alors il devrait afficher un message d'erreur
//       test("then it should display a message error", async () => {
//         console.error = jest.fn();
//         window.onNavigate(ROUTES_PATH.NewBill);
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             update: () => {
//               return Promise.reject(new Error("Erreur 404"));
//             },
//           };
//         });

//         const newBill = new NewBill({
//           document,
//           onNavigate,
//           store: mockStore,
//           localStorage: window.localStorage,
//         });

//         const form = screen.getByTestId("form-new-bill");
//         const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
//         form.addEventListener("submit", handleSubmit);

//         fireEvent.submit(form);

//         expect(handleSubmit).toHaveBeenCalled();

//         await waitFor(() => new Promise(process.nextTick));

//         expect(console.error).toHaveBeenCalled();
//       });
//     });
//   });
// });