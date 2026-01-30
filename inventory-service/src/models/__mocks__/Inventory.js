// Manual mock for Inventory model
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockFind = jest.fn();
const mockCountDocuments = jest.fn();

const Inventory = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true),
    quantity: 0,
    reservedQuantity: 0
}));

Inventory.findOne = mockFindOne;
Inventory.create = mockCreate;
Inventory.find = mockFind;
Inventory.countDocuments = mockCountDocuments;

module.exports = Inventory;
