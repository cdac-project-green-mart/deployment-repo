// Manual mock for UserProfile model
const mockFindOne = jest.fn();
const mockCreate = jest.fn();

const UserProfile = jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(true)
}));

UserProfile.findOne = mockFindOne;
UserProfile.create = mockCreate;

module.exports = UserProfile;
