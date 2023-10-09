import woofs from './woofs.json';

export const woof = () => {
    return woofs[Math.floor(Math.random() * woofs.length)];
};