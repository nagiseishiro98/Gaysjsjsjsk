import { LicenseKey, KeyStatus, GenerateKeyParams, DurationType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'keymaster_db_v1';

export const getKeys = (): LicenseKey[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveKeys = (keys: LicenseKey[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
};

export const generateUniqueKey = (prefix: string = 'KEY'): string => {
  const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${prefix.toUpperCase()}-${randomPart.toUpperCase().match(/.{1,4}/g)?.join('-')}`;
};

export const createKey = (params: GenerateKeyParams): LicenseKey => {
  const now = Date.now();
  let expirationTime = 0;

  switch (params.durationType) {
    case DurationType.MINUTES:
      expirationTime = now + params.durationValue * 60 * 1000;
      break;
    case DurationType.HOURS:
      expirationTime = now + params.durationValue * 60 * 60 * 1000;
      break;
    case DurationType.DAYS:
      expirationTime = now + params.durationValue * 24 * 60 * 60 * 1000;
      break;
    case DurationType.YEARS:
      expirationTime = now + params.durationValue * 365 * 24 * 60 * 60 * 1000;
      break;
  }

  const newKey: LicenseKey = {
    id: uuidv4(),
    key: generateUniqueKey(params.prefix),
    note: params.note,
    createdAt: now,
    expiresAt: expirationTime,
    status: KeyStatus.ACTIVE,
    maxDevices: 1,
    boundDeviceId: null,
    lastUsed: null,
    ip: null
  };

  const currentKeys = getKeys();
  saveKeys([newKey, ...currentKeys]);
  return newKey;
};

export const toggleKeyStatus = (id: string): LicenseKey[] => {
  const keys = getKeys();
  const updatedKeys = keys.map(k => {
    if (k.id === id) {
      const newStatus = k.status === KeyStatus.ACTIVE ? KeyStatus.PAUSED : KeyStatus.ACTIVE;
      return { ...k, status: newStatus };
    }
    return k;
  });
  saveKeys(updatedKeys);
  return updatedKeys;
};

export const deleteKey = (id: string): LicenseKey[] => {
  const keys = getKeys();
  const updatedKeys = keys.filter(k => k.id !== id);
  saveKeys(updatedKeys);
  return updatedKeys;
};

export const resetHwid = (id: string): LicenseKey[] => {
  const keys = getKeys();
  const updatedKeys = keys.map(k => {
    if (k.id === id) {
      return { ...k, boundDeviceId: null };
    }
    return k;
  });
  saveKeys(updatedKeys);
  return updatedKeys;
};

export const banKey = (id: string): LicenseKey[] => {
    const keys = getKeys();
    const updatedKeys = keys.map(k => {
      if (k.id === id) {
        return { ...k, status: KeyStatus.BANNED };
      }
      return k;
    });
    saveKeys(updatedKeys);
    return updatedKeys;
}