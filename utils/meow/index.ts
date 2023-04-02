import meows from './meows.json';

export default () => {
    return meows[Math.floor(Math.random() * meows.length)];
};