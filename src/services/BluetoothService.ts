import { Platform } from 'react-native';

// Mock types since we can't import from ble-plx in Expo Go
interface Device {
    id: string;
    name: string | null;
    connect: () => Promise<Device>;
    discoverAllServicesAndCharacteristics: () => Promise<Device>;
}

class BluetoothService {
    // manager: BleManager; // Removed native dependency
    connectedDevice: Device | null = null;
    isMockMode: boolean = true;

    constructor() {
        // this.manager = new BleManager();
        console.log('BluetoothService initialized in Mock Mode for Expo Go');
    }

    async requestPermissions() {
        console.log('Requesting mocked permissions...');
        return true;
    }

    scanAndConnect() {
        console.log('Starting Mock Scan...');

        // Simulate finding a device after 2 seconds
        setTimeout(() => {
            console.log('Mock Device Found: FOR Ring');
            this.connectToMockDevice();
        }, 2000);
    }

    private connectToMockDevice() {
        const mockDevice: Device = {
            id: 'mock-id-123',
            name: 'FOR Ring',
            connect: async () => {
                console.log('Mock Connecting...');
                return mockDevice;
            },
            discoverAllServicesAndCharacteristics: async () => {
                console.log('Mock Discovering Services...');
                return mockDevice;
            }
        };

        mockDevice.connect().then(d => {
            d.discoverAllServicesAndCharacteristics().then(() => {
                this.connectedDevice = d;
                console.log('Mock Connection Complete');
            });
        });
    }
}

export const bluetoothService = new BluetoothService();
