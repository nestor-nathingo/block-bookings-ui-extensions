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
} from "@hubspot/ui-extensions";
import { validateBlockBookingForm } from "./utils/block-bookings-utils";

export const DealValidation = ({ context, runServerless, sendAlert }) => {
	const [formData, setFormData] = useState({});
	const [blockBookingType, setBlockBookingType] = useState("");
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

	const handleClick = async (bookingDisplays, bookingReference) => {
		console.log("Form data (in handleclick) submitted:", bookingDisplays ?? bookingReference);
		const { response } = await runServerless({ name: "bookingValidation", parameters: { bookingDisplays, bookingReference } });

		if (blockBookingType === "tour") {
			if (response.hasOwnProperty("Booking IDs") && response["Booking IDs"].length > 0) {
				console.log("Booking IDs:", response["Booking IDs"]);
				sendAlert({ message: "Form submitted successfully! Booking IDs: ", type: "success" });
				setFormValidationStates((prevStates) => ({
					...prevStates,
					innkeeperBookingReference: {
						...prevStates.innkeeperBookingReference,
						isValid: true,
					},
				}));
			} else {
				console.log("No Booking IDs found in response");
				sendAlert({ message: "Form submitted successfully! No Booking IDs found.", type: "warning" });
				setFormValidationStates((prevStates) => ({
					...prevStates,
					innkeeperBookingReference: {
						...prevStates.innkeeperBookingReference,
						isValid: false,
						patternMessage: "No Booking IDs found for the provided reference.",
					},
				}));
			}
		} else {
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
			} else {
				// stub
			}


		}

		// sendAlert({ message: "Form submitted successfully! Response: " + response, type: "success" });
	};

	const dealTypeOptions = [
		{ label: "New Business", value: "newbusiness" },
		{ label: "Existing Business", value: "existingbusiness" },
	]

	const blockBookingTypeOptions = [
		{ label: "ADHOC", value: "adhoc" },
		{ label: "TOUR", value: "tour" },
		{ label: "FIT", value: "fit" },
	];

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
					}}
				/>
			);
		}
	}

	return (
		<>
			<Form
				// get form data on submit
				onSubmit={(event) => {
					const bookingDisplays = event.targetValue["innkeeper-booking-numbers"]; // ? event.targetValue["innkeeper-booking-numbers"].split(",").map(item => item.trim()) : [];
					const bookingReference = event.targetValue["innkeeper-booking-reference"]; // ? event.targetValue["innkeeper-booking-reference"].split(",").map(item => item.trim()) : [];

					setFormData(event.targetValue);

					// validateBlockBookingForm(event, sendAlert, formValidationStates, setFormValidationStates, handleClick);
					validateBlockBookingForm(event, sendAlert, getFormStates, setFormValidationStates, () => handleClick(bookingDisplays, bookingReference));
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
				<Button
					variant="primary"
					type="submit"
				>
					Submit
				</Button>
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
