import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager, Device, Service, Characteristic } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';

class BluetoothService {
    manager: BleManager;
    connectedDevice: Device | null = null;
    connectionListeners: ((isConnected: boolean) => void)[] = [];

    constructor() {
        this.manager = new BleManager();
    }

    async requestPermissions() {
        if (Platform.OS === 'android') {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'Bluetooth Low Energy requires Location',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                return (
                    result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                    result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED
                );
            }
        } else {
            return true; // iOS handles permissions via Info.plist
        }
    }

    scanForDevices(onDeviceFound: (device: Device) => void) {
        this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.log('[BLE] Scan Error:', error);
                return;
            }
            if (device && (device.name || device.localName)) {
                onDeviceFound(device);
            }
        });
    }

    stopScan() {
        this.manager.stopDeviceScan();
    }

    async getConnectedDevices() {
        // Standard services for health rings (full 128-bit UUIDs for reliability)
        const serviceUUIDs = [
            '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate
            '0000180f-0000-1000-8000-00805f9b34fb', // Battery
            '0000fdda-0000-1000-8000-00805f9b34fb', // Proprietary Data
            '0000fee7-0000-1000-8000-00805f9b34fb'  // Proprietary Data
        ];
        try {
            return await this.manager.connectedDevices(serviceUUIDs);
        } catch (e) {
            console.log('[BLE] Error getting connected devices:', e);
            return [];
        }
    }

    async connectToDevice(deviceId: string): Promise<Device> {
        try {
            console.log('[BLE] ========== CONNECTION ATTEMPT START ==========');
            console.log('[BLE] Device ID:', deviceId);
            console.log('[BLE] Stopping scan...');
            this.stopScan();

            // Check if device is already connected via system
            console.log('[BLE] Checking for existing connections...');

            // Try to get the device directly if it's already connected
            try {
                const device = await this.manager.devices([deviceId]);
                if (device && device.length > 0) {
                    const existingDevice = device[0];
                    const isConnected = await existingDevice.isConnected();

                    if (isConnected) {
                        console.log('[BLE] ✓ Device is already connected via system!');
                        console.log('[BLE] Using existing system connection...');
                        this.connectedDevice = await existingDevice.discoverAllServicesAndCharacteristics();
                        console.log('[BLE] ✓ Services discovered on existing connection!');
                        console.log('[BLE] ========== CONNECTION SUCCESSFUL (EXISTING) ==========');
                        return this.connectedDevice;
                    }
                }
            } catch (e) {
                console.log('[BLE] No existing connection found, will create new one');
            }

            // Direct connection without autoConnect for faster response
            // iOS will automatically show pairing dialog if needed
            console.log('[BLE] Initiating new connection with 10s timeout...');
            const device = await this.manager.connectToDevice(deviceId, {
                requestMTU: 512,
                timeout: 10000,
            });

            console.log('[BLE] ✓ Device connected successfully!');
            console.log('[BLE] Device name:', device.name);
            console.log('[BLE] Device ID:', device.id);
            console.log('[BLE] Discovering services and characteristics...');
            this.connectedDevice = await device.discoverAllServicesAndCharacteristics();

            // Set up disconnection listener
            this.manager.onDeviceDisconnected(device.id, (error, b) => {
                console.log('[BLE] Device disconnected!', error);
                this.connectedDevice = null;
                this.notifyConnectionListeners(false);
            });

            console.log('[BLE] ✓ Services discovered successfully!');
            console.log('[BLE] ========== CONNECTION SUCCESSFUL ==========');
            this.notifyConnectionListeners(true);
            return this.connectedDevice;
        } catch (error: any) {
            this.connectedDevice = null;
            this.notifyConnectionListeners(false);
            console.error('[BLE] Connection Error:', error);
            console.error('[BLE] Error details:', {
                message: error.message,
                reason: error.reason,
                errorCode: error.errorCode,
                attErrorCode: error.attErrorCode,
            });

            // Check if device is already connected
            if (error.message?.includes('already connected')) {
                console.log('[BLE] Device already connected, attempting to use existing connection');
                try {
                    const devices = await this.manager.connectedDevices([]);
                    const existingDevice = devices.find(d => d.id === deviceId);
                    if (existingDevice) {
                        this.connectedDevice = await existingDevice.discoverAllServicesAndCharacteristics();
                        console.log('[BLE] Using existing connection successfully');
                        return this.connectedDevice;
                    }
                } catch (e) {
                    console.error('[BLE] Failed to use existing connection:', e);
                }
            }

            // Provide helpful error messages
            if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
                throw new Error('Unable to connect to ring.\n\nThis usually means:\n• Ring is paired with another device\n• Ring is in sleep mode\n• Ring battery is low\n\nTry:\n1. Restart the ring if possible\n2. Make sure no other apps are using it\n3. Move very close to the ring');
            } else if (error.message?.includes('cancelled')) {
                throw new Error('Connection cancelled.\n\nIf a pairing dialog appeared, please accept it.');
            } else if (error.message?.includes('already connected')) {
                throw new Error('Ring is connected to another app.\n\nPlease close other apps using Bluetooth.');
            }

            throw error;
        }
    }

    async disconnect() {
        if (this.connectedDevice) {
            try {
                console.log('[BLE] Disconnecting from:', this.connectedDevice.id);
                await this.manager.cancelDeviceConnection(this.connectedDevice.id);
                this.connectedDevice = null;
                this.notifyConnectionListeners(false);
                console.log('[BLE] Disconnected successfully');
            } catch (error) {
                console.error('[BLE] Disconnect error:', error);
            }
        }
    }

    async getServices(deviceId: string): Promise<Service[]> {
        if (!this.connectedDevice) throw new Error('No device connected');
        return await this.connectedDevice.services();
    }

    async getCharacteristics(deviceId: string, serviceUUID: string): Promise<Characteristic[]> {
        if (!this.connectedDevice) throw new Error('No device connected');
        return await this.connectedDevice.characteristicsForService(serviceUUID);
    }

    async logAllServicesAndCharacteristics() {
        if (!this.connectedDevice) {
            console.log('[BLE] No device connected to log');
            return;
        }

        try {
            const services = await this.connectedDevice.services();
            console.log(`[BLE] Found ${services.length} services`);

            for (const service of services) {
                console.log(`[BLE] Service: ${service.uuid}`);
                const characteristics = await service.characteristics();
                for (const char of characteristics) {
                    console.log(`[BLE]   - Characteristic: ${char.uuid} (Properties: ${JSON.stringify(char)})`);
                    if (char.isReadable) {
                        try {
                            const value = await char.read();
                            console.log(`[BLE]     Value: ${value.value}`);
                        } catch (e) {
                            console.log(`[BLE]     (Read failed)`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[BLE] Error logging services:', error);
        }
    }

    async readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<string | null> {
        if (!this.connectedDevice) throw new Error('No device connected');
        try {
            const char = await this.connectedDevice.readCharacteristicForService(serviceUUID, characteristicUUID);
            return char.value || null;
        } catch (error) {
            console.error(`[BLE] Error reading ${characteristicUUID}:`, error);
            return null;
        }
    }

    async writeCharacteristic(serviceUUID: string, characteristicUUID: string, base64Value: string): Promise<void> {
        if (!this.connectedDevice) throw new Error('No device connected');
        try {
            await this.connectedDevice.writeCharacteristicWithResponseForService(serviceUUID, characteristicUUID, base64Value);
            console.log(`[BLE] Wrote (With Response) to ${characteristicUUID}: ${base64Value}`);
        } catch (error) {
            console.error(`[BLE] Error writing (With Response) to ${characteristicUUID}:`, error);
            throw error;
        }
    }

    async writeCharacteristicWithoutResponse(serviceUUID: string, characteristicUUID: string, base64Value: string): Promise<void> {
        if (!this.connectedDevice) throw new Error('No device connected');
        try {
            await this.connectedDevice.writeCharacteristicWithoutResponseForService(serviceUUID, characteristicUUID, base64Value);
            console.log(`[BLE] Wrote (Without Response) to ${characteristicUUID}: ${base64Value}`);
        } catch (error) {
            console.error(`[BLE] Error writing (Without Response) to ${characteristicUUID}:`, error);
            throw error;
        }
    }

    monitorCharacteristic(serviceUUID: string, characteristicUUID: string, onUpdate: (value: string | null) => void) {
        if (!this.connectedDevice) throw new Error('No device connected');
        console.log(`[BLE] Monitoring ${characteristicUUID}...`);
        return this.connectedDevice.monitorCharacteristicForService(serviceUUID, characteristicUUID, (error, char) => {
            if (error) {
                console.error(`[BLE] Monitor Error (${characteristicUUID}):`, error);
                return;
            }
            onUpdate(char?.value || null);
        });
    }

    // Helper to decode Base64 (Standard in react-native-ble-plx)
    decodeBase64(value: string): number[] {
        const binaryString = atob(value);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return Array.from(bytes);
    }

    // Helper to encode Base64
    encodeBase64(data: number[] | Uint8Array): string {
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private calculateChecksum(data: number[]): number {
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        return sum & 0xFF;
    }

    private async sendProprietaryCommand(header: number, cmd: number, payload: number[] = [], useRaw: boolean = false): Promise<void> {
        const MHCS_SERVICE = '0000fdda-0000-1000-8000-00805f9b34fb';
        const MHCS_COMMAND = '0000fdd2-0000-1000-8000-00805f9b34fb';

        if (useRaw) {
            // Some rings (like J-Style) responder to raw single-byte start/stop commands
            console.log(`[BLE] Sending Raw Command: ${payload.map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
            await this.writeCharacteristicWithoutResponse(MHCS_SERVICE, MHCS_COMMAND, this.encodeBase64(payload));
            return;
        }

        const packet = new Array(16).fill(0);
        packet[0] = header;
        packet[1] = cmd;
        for (let i = 0; i < payload.length && i < 13; i++) {
            packet[2 + i] = payload[i];
        }
        packet[15] = this.calculateChecksum(packet.slice(0, 15));

        console.log(`[BLE] Sending MHCS Command: ${packet.map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
        await this.writeCharacteristicWithoutResponse(MHCS_SERVICE, MHCS_COMMAND, this.encodeBase64(packet));
    }

    // Standard GATT Parsers
    parseHeartRate(base64Value: string): number | null {
        try {
            const data = this.decodeBase64(base64Value);

            // FDD 4-byte format: [0x01, HR, HRV, Status]
            // This matches the user's log 'AUAfAA==' -> [1, 64, 31, 0]
            if (data.length === 4 && data[0] === 0x01) {
                const bpm = data[1];
                if (bpm > 30 && bpm < 220) return bpm;
                return null;
            }

            // MHCS 16+ byte format (EF 02 ... HR at index 6)
            if (data.length >= 7 && data[0] === 0xEF && data[1] === 0x02) {
                return data[6]; // 7th byte is HR in this protocol
            }

            // Fallback to Standard GATT
            if (data.length < 2) return null;
            const flags = data[0];
            const isUint16 = (flags & 0x01) !== 0;

            if (isUint16) {
                return (data[2] << 8) | data[1];
            } else {
                return data[1];
            }
        } catch (error) {
            console.error('[BLE] Heart Rate parse error:', error);
            return null;
        }
    }

    parseBatteryLevel(base64Value: string): number | null {
        try {
            const data = this.decodeBase64(base64Value);
            if (data.length < 1) return null;
            return data[0]; // Standard 2A19 is 1 byte (0-100)
        } catch (error) {
            console.error('[BLE] Battery parse error:', error);
            return null;
        }
    }

    /**
     * Activates continuous/dynamic measurement mode for heart rate and SpO2.
     * This ensures the green (HR) or red (SpO2) LEDs are active as long as the ring is connected.
     */
    async startLiveMonitoring(): Promise<void> {
        if (!this.connectedDevice) {
            console.log('[BLE] Cannot start live monitoring: No device connected');
            return;
        }

        console.log(`[BLE] Activating Continuous Monitoring for device ${this.connectedDevice.id}...`);
        try {
            // Sequence found to be most effective for MHCS rings (Green light persistence):
            // 1. Enable Real-time Transfer (Toggle)
            console.log('[BLE] Sending Enable Real-time Transfer (EF 31 01)...');
            await this.sendProprietaryCommand(0xEF, 0x31, [0x01]);
            await this.delay(200);

            // 2. Enable Dynamic Heart Rate (Continuous)
            console.log('[BLE] Sending Enable Dynamic HR (EF 11 02)...');
            await this.sendProprietaryCommand(0xEF, 0x11, [0x02]);
            await this.delay(200);

            // 3. Enable Dynamic SpO2 (Continuous) - optional but helps keep sensor active
            console.log('[BLE] Sending Enable Dynamic SpO2 (EF 12 02)...');
            await this.sendProprietaryCommand(0xEF, 0x12, [0x02]);

            // DO NOT send 0x01 (Single Shot) commands here as they can cancel the continuous mode.

            console.log('[BLE] Continuous monitoring commands sent successfully');
        } catch (error) {
            console.error('[BLE] Failed to activate live monitoring:', error);
        }
    }

    /**
     * Triggers a manual single-point heart rate measurement
     */
    async triggerManualHeartRateScan(): Promise<void> {
        const HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
        const HR_CONTROL_POINT = '00002a39-0000-1000-8000-00805f9b34fb';

        try {
            console.log('[BLE] Starting manual measurement triggers...');
            console.trace('[BLE] Trace triggerHeartRateScan caller');

            // 1. Standard GATT HR Start
            try {
                await this.writeCharacteristic(HR_SERVICE, HR_CONTROL_POINT, this.encodeBase64([0x01]));
            } catch (e) { }
            await this.delay(300);

            // 2. Proprietary Manual HR Start (EF 11 01)
            await this.sendProprietaryCommand(0xEF, 0x11, [0x01]);
            await this.delay(300);

            // 3. Proprietary Manual SpO2 Start (EF 12 01)
            await this.sendProprietaryCommand(0xEF, 0x12, [0x01]);

            // 4. Fallback 1-byte triggers only if needed (sending anyway to be safe)
            await this.sendProprietaryCommand(0, 0, [0x01], true);
            await this.sendProprietaryCommand(0, 0, [0x03], true);

            console.log('[BLE] All manual measurement triggers sent');
        } catch (error) {
            console.error('[BLE] Failed to trigger manual scan:', error);
        }
    }

    isConnected(): boolean {
        return this.connectedDevice !== null;
    }

    getConnectedDeviceId(): string | null {
        return this.connectedDevice?.id || null;
    }

    onConnectionChange(listener: (isConnected: boolean) => void) {
        this.connectionListeners.push(listener);
        return () => {
            this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
        };
    }

    private notifyConnectionListeners(isConnected: boolean) {
        this.connectionListeners.forEach(l => l(isConnected));
    }
}

export const bluetoothService = new BluetoothService();
