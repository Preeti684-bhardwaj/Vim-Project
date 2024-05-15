const ErrorHandler = require("../utils/errorHandler");
const InstructionModel = require("../modal/instructionModal")
// const {isValidEmail,isValidPhone ,isValidPassword, isValidLength} = require("../utils/validation");
const asyncHandler = require("../utils/asyncHandler");

const createInstruction = asyncHandler(async (req, res, next) => {
    const { title, description } = req.body;

    if (
        [title].some((field) => field?.trim() == "")
    ) {
        return next(
            new ErrorHandler(
                "Please provide all necessary fields",
                400
            )
        )
    }
    if(!description || description.length==0){
        return next(
            new ErrorHandler(
                "Please provide description fields",
                400
            )
        )
    }

     if(!Array.isArray(description)){
        return next(
            new ErrorHandler(
                "description field should be in array",
                400
            )
        )
     }
    const instructionData = await InstructionModel.findOne();
    if (instructionData) {
        return next(
            new ErrorHandler(
                "instruction data already created",
                400
            )
        )
    }

    const instruction = await InstructionModel.create({
        title,
        description
    });

    return res.status(201).json({
        success: true,
        message: "instruction created Successfully",
        data: instruction
    })
})

const getInstruction = asyncHandler(async (req, res, next) => {

    const instructionData = await InstructionModel.findOne();
    if (!instructionData) {
        return next(
            new ErrorHandler(
                "instruction data not found",
                400
            )
        )
    }

    return res.status(200).json({
        success: true,
        data: instructionData
    })
})
const updateInstruction = asyncHandler(async (req, res, next) => {
    const { title, description } = req.body;

    // Validate if title and description are provided
    if (!title || !description) {
        return next(new ErrorHandler("Please provide both title and description", 400));
    }

    try {
        // Find existing instruction data
        const instructionInfo = await InstructionModel.findOne();
        console.log(instructionInfo);

        // If instruction data not found, return an error
        if (!instructionInfo) {
            return next(new ErrorHandler("Instruction data not found", 404));
        }

        // Update instruction data with new values
        instructionInfo.title = title;
        instructionInfo.description = description;

        // Save the updated instruction data to the database
        await instructionInfo.save({validate:false});

        // Return the updated instruction data in the response
        res.status(200).json({
            success: true,
            data: instructionInfo,
            message: "Instruction data updated successfully",
        });
    } catch (error) {
        // Handle database errors
        return next(new ErrorHandler("Failed to update instruction data", 500));
    }
});

module.exports = {
    createInstruction,
    updateInstruction,
    getInstruction
};