import React, { useState } from "react";
import {
	Divider,
	Link,
	Button,
	Text,
	Input,
	Flex,
	Form,
	Select,
	LoadingButton,
} from "@hubspot/ui-extensions";
import { validateBlockBookingForm } from "./utils/block-bookings-utils";

export const DealValidation = ({ context, runServerless, sendAlert }) => {
	const ticketId = context?.crm?.objectId;
	const [blockBookingType, setBlockBookingType] = useState("");
	const [isLoading, setIsLoading] = useState(null);
	const [validatedFormData, setValidatedFormData] = useState(null);
	const [isFormSubmissionSuccessful, setIsFormSubmissionSuccessful] = useState(false);
	const [formValidationStates, setFormValidationStates] = useState({
		dealName: {
			required: true,
			message: "Please enter a name for the block booking",
			isValid: true,
			label: "deal-name",
		},
		dealType: {
			required: true,
			message: "Please select a deal type",
			isValid: true,
			label: "deal-type",
		},
		dealStage: {
			required: true,
			message: "Please select a deal stage",
			isValid: true,
			label: "deal-stage",
		},
		blockBookingType: {
			required: true,
			message: "Please select a block booking type",
			isValid: true,
			label: "block-booking-type",
		},
		innkeeperBookingNumbers: {
			required: true,
			message: "Please enter innkeeper booking numbers",
			pattern: /^([A-Z]{2}\d+(?:,\s*[A-Z]{2}\d+)*)$/,
			patternMessage: "Innkeeper booking numbers must be a comma-separated list of two capital letters followed by numbers (e.g. AA1234, BB5678)",
			isValid: true,
			label: "innkeeper-booking-numbers",
		},
		innkeeperBookingReference: {
			required: true,
			message: "Please enter innkeeper booking reference",
			patternMessage: "Innkeeper booking reference must exist on Innkeeper",
			isValid: true,
			label: "innkeeper-booking-reference",
		},
		emailRecipient: {
			required: false,
			message: "Please enter email recipient",
			pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
			patternMessage: "Email recipient must be a valid email address (e.g. example@domain.com)",
			isValid: true,
			label: "block-booking-email-recipient",
		},
	});

	const getFormStates = () => {
		// Perform validation logic here
		return formValidationStates;
	}

	const createDeal = async (dealName, dealType, blockBookingType, innkeeperBookingNumbers, innkeeperBookingReference, dealStage, emailRecipient, ticketId) => {
		const { response } = await runServerless({
			name: "createDeal",
			parameters: {
				dealName,
				dealType,
				blockBookingType,
				innkeeperBookingNumbers,
				innkeeperBookingReference,
				dealStage,
				emailRecipient,
				ticketId, // Pass the ticket ID to the serverless function
			}
		});
		console.log("Response from createDeal:", response);

	}

	/**
	 * Handles the click event for submitting the booking validation form.
	 * This function sets the loading state, retrieves the booking displays and reference,
	 * and calls the serverless function for booking validation.
	 * @param {Array} bookingDisplays - The array of booking displays.
	 * @param {string} bookingReference - The innkeeper booking reference.
	 */

	const handleClick = async (bookingDisplays, bookingReference) => {
		setIsLoading(true);
		const { response } = await runServerless({ name: "bookingValidation", parameters: { bookingDisplays, bookingReference } });

		if (blockBookingType === "tour") {
			if (response.hasOwnProperty("Booking IDs") && response["Booking IDs"].length > 0) {
				// console.log("Booking IDs:", response["Booking IDs"]);
				sendAlert({ message: `Booking IDs: ${response["Booking IDs"].length} bookings`, type: "success" });
				setFormValidationStates((prevStates) => ({
					...prevStates,
					innkeeperBookingReference: {
						...prevStates.innkeeperBookingReference,
						isValid: true,
					},
				}));
				setIsLoading(false);
				setIsFormSubmissionSuccessful(true);
			} else {

				// console.log("No Booking IDs found in response");
				sendAlert({ message: "No Booking IDs found.", type: "warning" });
				setFormValidationStates((prevStates) => ({
					...prevStates,
					innkeeperBookingReference: {
						...prevStates.innkeeperBookingReference,
						isValid: false,
						patternMessage: "No Booking IDs found for the provided reference.",
					},
				}));
				setIsLoading(false);
				setIsFormSubmissionSuccessful(false);
			}
		} else {
			// If the block booking type is not "tour", we assume it's "adhoc" or "fit"
			const filteredObject = Object.fromEntries(
				Object.entries(response).filter(([key, value]) => {
					console.log("Filtering key:", key, "with value:", value);
					return value.isValid === false;
				})
			);
			console.log("Filtered Object:", filteredObject);

			if (Object.keys(filteredObject).length) {
				let errorMessage = "";
				Object.entries(filteredObject).forEach(([key, value], index) => {
					console.log(`Key: ${key}, Value: ${value.isValid}, Message: ${value.message}`);
					if (!value.isValid) {
						sendAlert({ message: `Error in booking number ${index} ${key}: ${value.message}`, type: "danger" });
						errorMessage += index > 0 ? ", " + value.message : value.message;
						return;
					}
				});
				setFormValidationStates((prevStates) => ({
					...prevStates,
					innkeeperBookingNumbers: {
						...prevStates.innkeeperBookingNumbers,
						isValid: false,
						patternMessage: errorMessage,
					},
				}));
				setIsLoading(false);
				setIsFormSubmissionSuccessful(false);

			} else {
				sendAlert({ message: "All booking numbers are valid.", type: "success" });
				setFormValidationStates((prevStates) => ({
					...prevStates,
					innkeeperBookingNumbers: {
						...prevStates.innkeeperBookingNumbers,
						isValid: true,
					},
				}));
				setIsLoading(false);
				setIsFormSubmissionSuccessful(true);
			}
		}
	};
	// Define the options for the select inputs
	const dealTypeOptions = [
		{ label: "New Business", value: "newbusiness" },
		{ label: "Existing Business", value: "existingbusiness" },
	]

	const dealStageOptions = [
		{ label: "Booking Made", value: "227262248" },
		{ label: "120 Day", value: "216992673" },
		{ label: "90 Day", value: "216992674" },
		{ label: "60 Day", value: "216992675" },
		{ label: "30 Day", value: "216992676" },
		{ label: "Confirmed", value: "216992677" },
		{ label: "Cancelled", value: "216992678" },
	];

	const blockBookingTypeOptions = [
		{ label: "ADHOC", value: "adhoc" },
		{ label: "TOUR", value: "tour" },
		{ label: "FIT", value: "fit" },
	];

	/**
	 * Returns the booking reference input field based on the block booking type.
	 * If the block booking type is "tour", it returns an input for the innkeeper booking reference.
	 * Otherwise, it returns an input for the innkeeper booking numbers.
	 * @returns {JSX.Element} The input field for booking reference or booking numbers.
	 */

	function bookingReferenceInput() {
		if (blockBookingType === "tour") {
			return (
				<Input
					label="InnKeeper Booking Reference *"
					name="innkeeper-booking-reference"
					tooltip="Please enter the innkeeper booking reference"
					description="Please enter the innkeeper booking reference"
					placeholder="Innkeeper Booking Reference"
					error={!formValidationStates.innkeeperBookingReference.isValid}
					validationMessage={formValidationStates.innkeeperBookingReference.patternMessage}
					onChange={(value) => {
						const pattern = formValidationStates.innkeeperBookingReference.pattern;
						const isValid = value.trim().length > 0;
						setFormValidationStates((prevStates) => ({
							...prevStates,
							innkeeperBookingReference: {
								...prevStates.innkeeperBookingReference,
								isValid: isValid,
							},
							...(blockBookingType === "tour" && { innkeeperBookingNumbers: { ...prevStates.innkeeperBookingNumbers, isValid: true } }),
						}));
						setIsFormSubmissionSuccessful(true);

					}}
				/>
			);
		} else {
			return (
				<Input
					label="InnKeeper Booking Numbers *"
					name="innkeeper-booking-numbers"
					tooltip="Please enter the innkeeper booking numbers"
					description="Please enter the innkeeper booking numbers"
					placeholder="Innkeeper Booking Numbers"
					error={!formValidationStates.innkeeperBookingNumbers.isValid}
					validationMessage={formValidationStates.innkeeperBookingNumbers.patternMessage}
					onChange={(value) => {

						const pattern = formValidationStates.innkeeperBookingNumbers.pattern;
						const isValid = pattern.test(value);
						setFormValidationStates((prevStates) => ({
							...prevStates,
							innkeeperBookingNumbers: {
								...prevStates.innkeeperBookingNumbers,
								isValid: isValid,
							},
							...(blockBookingType !== "tour" && { innkeeperBookingReference: { ...prevStates.innkeeperBookingReference, isValid: true } })
						}));
						// setIsLoading(false);
						setIsFormSubmissionSuccessful(true);
					}}
				/>
			);
		}
	}

	return (
		<>
			{console.log("Rendering DealValidation component with context:", context)}
			<Form
				// get form data on submit
				onSubmit={(event) => {
					// setIsFormSubmissionSuccessful(false);
					const bookingDisplays = event.targetValue["innkeeper-booking-numbers"];
					const bookingReference = event.targetValue["innkeeper-booking-reference"];
					const dealName = event.targetValue["deal-name"];
					const dealType = event.targetValue["deal-type"];
					const blockBookingType = event.targetValue["block-booking-type"];
					const dealStage = event.targetValue["deal-stage"];
					const emailRecipient = event.targetValue["block-booking-email-recipient"];
					validateBlockBookingForm(
						event,
						sendAlert,
						getFormStates,
						setFormValidationStates,
						() => {
							handleClick(bookingDisplays, bookingReference);
							setValidatedFormData({
								dealName,
								dealType,
								blockBookingType,
								innkeeperBookingNumbers: bookingDisplays,
								innkeeperBookingReference: bookingReference,
								dealStage,
								emailRecipient
							});
						},

					);
				}}
			>
				<Input
					label="Deal Name"
					name="deal-name"
					tooltip="Please enter your deal name"
					description="Please enter your deal name"
					placeholder="Deal name"
					required={true}
					error={!formValidationStates.dealName.isValid}
					validationMessage={formValidationStates.dealName.message}
					onChange={(value) => {
						const isValid = value.trim() !== "";
						setFormValidationStates((prevStates) => ({
							...prevStates,
							dealName: {
								...prevStates.dealName,
								isValid: isValid,
							},
						}));
					}}
				/>
				<Select
					label="Deal Type"
					name="deal-type"
					tooltip="Please enter the deal type"
					description="Please enter the deal type"
					placeholder="Deal type"
					required={true}
					error={!formValidationStates.dealType.isValid}
					validationMessage={formValidationStates.dealType.message}
					options={dealTypeOptions}
					onChange={(value) => {
						const isValid = value.trim() !== "";
						console.log(`Deal type validation: ${isValid}`);
						setFormValidationStates((prevStates) => ({
							...prevStates,
							dealType: {
								...prevStates.dealType,
								isValid: isValid,
							},
						}));
					}}
				/>
				<Select
					label="Block Booking Type"
					name="block-booking-type"
					tooltip="Please enter the block booking type"
					description="Please enter the block booking type"
					placeholder="Block Booking Type"
					required={true}
					error={!formValidationStates.blockBookingType.isValid}
					validationMessage={formValidationStates.blockBookingType.message}
					options={blockBookingTypeOptions}
					onChange={(value) => {
						const isValid = value.trim() !== "";
						console.log(`Block booking type value: ${value}`);
						setBlockBookingType(value);
						setFormValidationStates((prevStates) => ({
							...prevStates,
							blockBookingType: {
								...prevStates.blockBookingType,
								isValid: isValid,
							},
							...(value === "tour" || isValid == false && { innkeeperBookingNumbers: { ...prevStates.innkeeperBookingNumbers, isValid: true } }),
							...(value !== "tour" || isValid == false && { innkeeperBookingReference: { ...prevStates.innkeeperBookingReference, isValid: true } })

						}));
					}}
				/>
				{
					bookingReferenceInput()
				}

				<Select
					label="Deal Stage"
					name="deal-stage"
					tooltip="Please enter the deal stage"
					description="Please enter the deal stage"
					placeholder="Deal stage"
					required={true}
					error={!formValidationStates.dealStage.isValid}
					validationMessage={formValidationStates.dealStage.message}
					options={dealStageOptions}
					onChange={(value) => {
						const isValid = value !== "";
						setFormValidationStates((prevStates) => ({
							...prevStates,
							dealStage: {
								...prevStates.dealStage,
								isValid: isValid,
							},
						}));
					}}
				/>


				<Input
					label="Block Booking Email Recipient"
					name="block-booking-email-recipient"
					tooltip="Please enter the block booking email recipient"
					description="Please enter the block booking email recipient"
					placeholder="Block Booking Email Recipient"
					error={!formValidationStates.emailRecipient.isValid}
					validationMessage={formValidationStates.emailRecipient.message}
					onChange={(value) => {
						const pattern = formValidationStates.emailRecipient.pattern;
						const isValid = pattern.test(value) || value.trim().length === 0;
						setFormValidationStates((prevStates) => ({
							...prevStates,
							emailRecipient: {
								...prevStates.emailRecipient,
								isValid: isValid,
							},

						}));
					}}

				/>

				{/* //Condition: if the value of required input field is empty or isValid is false, then show the submit button, else show the create deal button only when the fields have been validated */}
				<LoadingButton
					variant="primary"
					type="submit"
					loading={isLoading}

				>
					Submit
				</LoadingButton>
				{isFormSubmissionSuccessful && validatedFormData && !isLoading && (
					<Button
						variant="secondary"
						disabled={!validatedFormData} // prevent accidental empty submit
						// onClick={async () => {
						// 	if (validatedFormData) {
						// 		await createDeal(
						// 			validatedFormData.dealName,
						// 			validatedFormData.dealType,
						// 			validatedFormData.blockBookingType,
						// 			validatedFormData.innkeeperBookingNumbers,
						// 			validatedFormData.innkeeperBookingReference,
						// 			validatedFormData.dealStage,
						// 			validatedFormData.emailRecipient,
						// 			ticketId
						// 		);
						// 	} else {
						// 		sendAlert({ message: "Please submit the form first", type: "danger" });
						// 	}
						// }}
					>
						Create new record
					</Button>
				)}

			</Form >
		</>
	);
};

// Define the Extension component, taking in runServerless, context, & sendAlert as props
export const HubExtension = ({ context, runServerless, sendAlert }) => {
	const [text, setText] = useState("");

	// Call serverless function to execute with parameters.
	// The `myFunc` function name is configured inside `serverless.json`
	const handleClick = async () => {
		const { response } = await runServerless({ name: "myFunc", parameters: { text: text } });
		sendAlert({ message: response });
	};

	return (
		<>
			<Text>
				<Text format={{ fontWeight: "bold" }}>
					Your first UI extension is ready!
				</Text>
				Congratulations, {context.user.firstName}! You just deployed your first
				HubSpot UI extension. This example demonstrates how you would send
				parameters from your React frontend to the serverless function and get a
				response back.
			</Text>
			<Flex direction="row" align="end" gap="small">
				<Input name="text" label="Send" onInput={(t) => setText(t)} />
				<Button type="submit" onClick={handleClick}>
					Click me
				</Button>
			</Flex>
			<Divider />
			<Text>
				What now? Explore all available{" "}
				<Link href="https://developers.hubspot.com/docs/platform/ui-extension-components">
					UI components
				</Link>
				, get an overview of{" "}
				<Link href="https://developers.hubspot.com/docs/platform/ui-extensions-overview">
					UI extensions
				</Link>
				, learn how to{" "}
				<Link href="https://developers.hubspot.com/docs/platform/create-ui-extensions">
					add a new custom card
				</Link>
				, jump right in with our{" "}
				<Link href="https://developers.hubspot.com/docs/platform/ui-extensions-quickstart">
					Quickstart Guide
				</Link>
				, or check out our{" "}
				<Link href="https://github.com/HubSpot/ui-extensions-react-examples">
					code Samples
				</Link>
				.
			</Text>
		</>
	);
};
