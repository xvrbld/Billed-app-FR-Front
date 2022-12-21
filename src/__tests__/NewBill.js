/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {toHaveClass} from "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";


jest.mock("../app/store", () => mockStore)
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the extension of an uploaded file is jpeg, jpg or png", () => {
      // On lance le stockage interne
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      // On ajoute un user Employee au local storage pour simuler la connexion
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // On récupère le HTML de la page NewBill
      const html = NewBillUI()
      document.body.innerHTML = html
      // On démarre le container newBill pour accèder à notre fonction
      const newBillContainer = new NewBill({document, onNavigate, Store: null, localStorage: window.localStorage})
      // On crée une simulation de la fonction handleChangeFile
      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile)
      // On récupère le champ fichier
      const inputFile = screen.getByTestId('file')
      // Quand un fichier est ajouté on appelle notre fonction simulée (handleChangeFile)
      inputFile.addEventListener('change', handleChangeFile)
      // On simule qu'un utilisateur ajoute un fichier
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['document.pdf'], 'document.pdf', {
              type: 'application/pdf',
            }),
          ],
        },
      })
      expect(handleChangeFile).toHaveBeenCalled();
      // On récupère le message d'erreur
      const errorFile = screen.getByTestId('error-file')
      expect(errorFile.textContent).toEqual('Fichier incorrect. JPEG, JPG ou PNG uniquement.');
    })

    test("Then mail bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getAllByTestId('icon-mail'))
      const mailIcon = screen.getAllByTestId('icon-mail')
      expect(mailIcon[0]).toHaveClass('active-icon')
    })

    //test: soumettre une facture
    test("Then create a new bill", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBillContainer = new NewBill({document, onNavigate, Store: null, localStorage: window.localStorage})
      const handleChangeFile = jest.fn(newBillContainer.handleChangeFile)
      const handleSubmit = jest.fn(newBillContainer.handleSubmit)
      const inputExpenseType = screen.getByTestId('expense-type')
      const inputExpenseName = screen.getByTestId('expense-name')
      const inputDatePicker = screen.getByTestId('datepicker')
      const inputAmount = screen.getByTestId('amount')
      const inputVat = screen.getByTestId('vat')
      const inputPct = screen.getByTestId('pct')
      const inputCommentary = screen.getByTestId('commentary')
      const inputFile = screen.getByTestId('file')
      const form = screen.getByTestId('form-new-bill')
      inputExpenseType.value = "Transports"
      inputExpenseName.value = "Vol Paris Londres"
      inputDatePicker.value = "2022-03-01"
      inputAmount.value = "348"
      inputVat.value = "70"
      inputPct.value = "20"
      inputCommentary.value = "Ceci est un commentaire"
      inputFile.addEventListener('change', handleChangeFile)
      form.addEventListener('submit', handleSubmit)
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(['document.pdf'], 'document.pdf', {
              type: 'application/pdf',
            }),
          ],
        },
      })
      fireEvent.submit(form)
      expect(handleChangeFile).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalled();
    })

    test("Then create a new bill from mock API POST", async () => {
      const bill = [{
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      }]
      const callStore = jest.spyOn(mockStore, 'bills');
      mockStore.bills().create(bill);
      expect(callStore).toHaveBeenCalled();
    })    
  })
})
