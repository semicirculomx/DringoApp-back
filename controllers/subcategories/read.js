import Subcategory from "../../models/SubCategory.js";

async function read_all(req,res,next){
    try {
    let docs = await Subcategory.find()
    return res.status(200).json(docs)
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message:error.message})
    }
}
export default read_all