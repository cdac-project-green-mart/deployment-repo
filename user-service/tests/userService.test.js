// Unit tests for UserService
jest.mock('../src/models/UserProfile');

const userService = require('../src/services/userService');
const UserProfile = require('../src/models/UserProfile');

describe('UserService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        it('should return existing profile', async () => {
            const mockProfile = {
                userId: 'user-123',
                phone: '1234567890',
                addresses: [],
                preferences: { newsletter: true, theme: 'light' }
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            const result = await userService.getProfile('user-123');

            expect(UserProfile.findOne).toHaveBeenCalledWith({ userId: 'user-123' });
            expect(result).toEqual(mockProfile);
        });

        it('should create profile if not exists', async () => {
            const mockCreatedProfile = {
                userId: 'user-456',
                phone: null,
                addresses: [],
                preferences: { newsletter: true, theme: 'light' }
            };

            UserProfile.findOne.mockResolvedValue(null);
            UserProfile.create.mockResolvedValue(mockCreatedProfile);

            const result = await userService.getProfile('user-456');

            expect(UserProfile.findOne).toHaveBeenCalledWith({ userId: 'user-456' });
            expect(UserProfile.create).toHaveBeenCalledWith({ userId: 'user-456' });
            expect(result).toEqual(mockCreatedProfile);
        });
    });

    describe('updateProfile', () => {
        it('should update profile phone', async () => {
            const mockProfile = {
                userId: 'user-123',
                phone: null,
                preferences: { toObject: () => ({ newsletter: true, theme: 'light' }) },
                save: jest.fn().mockResolvedValue(true)
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            const result = await userService.updateProfile('user-123', { phone: '9876543210' });

            expect(mockProfile.phone).toBe('9876543210');
            expect(mockProfile.save).toHaveBeenCalled();
        });

        it('should update preferences', async () => {
            const mockProfile = {
                userId: 'user-123',
                phone: null,
                preferences: { toObject: () => ({ newsletter: true, theme: 'light' }) },
                save: jest.fn().mockResolvedValue(true)
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            await userService.updateProfile('user-123', { preferences: { theme: 'dark' } });

            expect(mockProfile.preferences).toEqual({ newsletter: true, theme: 'dark' });
            expect(mockProfile.save).toHaveBeenCalled();
        });
    });

    describe('addAddress', () => {
        it('should add address to existing profile', async () => {
            const mockAddress = {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zip: '10001',
                country: 'USA',
                isDefault: false
            };

            const mockAddresses = [];
            const mockProfile = {
                userId: 'user-123',
                addresses: mockAddresses,
                save: jest.fn().mockResolvedValue(true)
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            const result = await userService.addAddress('user-123', mockAddress);

            expect(mockProfile.addresses).toHaveLength(1);
            expect(mockProfile.save).toHaveBeenCalled();
        });

        it('should unset other default addresses when adding default', async () => {
            const existingAddress = {
                street: '456 Oak Ave',
                isDefault: true
            };

            const newAddress = {
                street: '789 Pine St',
                isDefault: true
            };

            const mockProfile = {
                userId: 'user-123',
                addresses: [existingAddress],
                save: jest.fn().mockResolvedValue(true)
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            await userService.addAddress('user-123', newAddress);

            expect(existingAddress.isDefault).toBe(false);
            expect(mockProfile.save).toHaveBeenCalled();
        });
    });

    describe('getAddresses', () => {
        it('should return addresses when profile exists', async () => {
            const mockAddresses = [
                { _id: 'addr-1', street: '123 Main St', city: 'NYC' },
                { _id: 'addr-2', street: '456 Oak Ave', city: 'LA' }
            ];

            UserProfile.findOne.mockResolvedValue({ addresses: mockAddresses });

            const result = await userService.getAddresses('user-123');

            expect(result).toEqual(mockAddresses);
            expect(result).toHaveLength(2);
        });

        it('should return empty array if profile not found', async () => {
            UserProfile.findOne.mockResolvedValue(null);

            const result = await userService.getAddresses('user-123');

            expect(result).toEqual([]);
        });
    });

    describe('updateAddress', () => {
        it('should update address', async () => {
            const mockAddress = {
                _id: 'addr-1',
                street: '123 Main St',
                city: 'NYC',
                isDefault: false
            };

            const mockProfile = {
                userId: 'user-123',
                addresses: {
                    id: jest.fn().mockReturnValue(mockAddress),
                    forEach: jest.fn()
                },
                save: jest.fn().mockResolvedValue(true)
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            const result = await userService.updateAddress('user-123', 'addr-1', { city: 'Boston' });

            expect(mockProfile.addresses.id).toHaveBeenCalledWith('addr-1');
            expect(mockProfile.save).toHaveBeenCalled();
        });

        it('should throw error if profile not found', async () => {
            UserProfile.findOne.mockResolvedValue(null);

            await expect(userService.updateAddress('user-123', 'addr-1', {}))
                .rejects.toThrow('Profile not found');
        });

        it('should throw error if address not found', async () => {
            const mockProfile = {
                userId: 'user-123',
                addresses: {
                    id: jest.fn().mockReturnValue(null)
                }
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            await expect(userService.updateAddress('user-123', 'addr-unknown', {}))
                .rejects.toThrow('Address not found');
        });
    });

    describe('deleteAddress', () => {
        it('should delete address from profile', async () => {
            const mockAddress = {
                _id: 'addr-1',
                deleteOne: jest.fn()
            };

            const mockProfile = {
                userId: 'user-123',
                addresses: {
                    id: jest.fn().mockReturnValue(mockAddress)
                },
                save: jest.fn().mockResolvedValue(true)
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            const result = await userService.deleteAddress('user-123', 'addr-1');

            expect(mockProfile.addresses.id).toHaveBeenCalledWith('addr-1');
            expect(mockAddress.deleteOne).toHaveBeenCalled();
            expect(mockProfile.save).toHaveBeenCalled();
            expect(result.message).toBe('Address deleted successfully');
        });

        it('should throw error if profile not found', async () => {
            UserProfile.findOne.mockResolvedValue(null);

            await expect(userService.deleteAddress('user-123', 'addr-1'))
                .rejects.toThrow('Profile not found');
        });

        it('should throw error if address not found', async () => {
            const mockProfile = {
                userId: 'user-123',
                addresses: {
                    id: jest.fn().mockReturnValue(null)
                }
            };

            UserProfile.findOne.mockResolvedValue(mockProfile);

            await expect(userService.deleteAddress('user-123', 'addr-unknown'))
                .rejects.toThrow('Address not found');
        });
    });
});
