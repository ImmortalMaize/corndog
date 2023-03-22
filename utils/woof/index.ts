import woofs from './woofs.json';

export default () => {
    return woofs[Math.floor(Math.random() * woofs.length)];
};