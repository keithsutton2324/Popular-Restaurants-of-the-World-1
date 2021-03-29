import translate from 'translate';

async function translateString(str, translateTo ) {
    translate.engine = 'libre';
    const translated_string = await translate(str, translateTo);
    
    return translated_string;
} 

export default translateString;