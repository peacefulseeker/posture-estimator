import {i18n} from '../i18n';

const sizesMapper = {
    ru: ['Битов', 'КБ', 'МБ'],
    en: ['Bits', 'KB', 'MB'],
};

export default function bytesToSize(bytes) {
    const sizes = sizesMapper[i18n.language] || sizesMapper.ru;

    if (bytes === 0) return sizes[0];

    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}
