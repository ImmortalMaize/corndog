import meows from './meows.json';

export const meow = () => {
    return meows[Math.floor(Math.random() * meows.length)];
};