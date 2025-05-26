import dataUriParser from "datauri/parser.js";
import path from "path";

const parser = new dataUriParser();

const getDataUri = () => {
   const extName = path.extname(fileURLToPath.orignalname).toString();
   return parser.format(extName, File.buffer).content;

}

export default getDataUri;