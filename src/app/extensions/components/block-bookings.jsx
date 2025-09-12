/**
 * Block Bookings
 * @author: Nestor Nathingo & Salim Katjivirue
 * @description: This is a sample HubSpot UI extension that demonstrates how to validate and create deals for block bookings.
 */

import React, { useState, useEffect } from "react";
import {
	Text,
	Input,
	Form,
	Select,
	LoadingButton,
} from "@hubspot/ui-extensions";
import { validateBlockBookingForm } from "./utils/block-bookings-utils";

export const DealValidation = ({ context, runServerless, sendAlert }) => {
	const ticketId = context?.crm?.objectId;
	const [blockBookingType, setBlockBookingType] = useState("");
	const [emailRecipient, setEmailRecipient] = useState("");
	const [isLoading, setIsLoading] = useState(null);
	const [validatedFormData, setValidatedFormData] = useState(null);
	const [isFormSubmissionSuccessful, setIsFormSubmissionSuccessful] = useState(false);

	const [isCreatingDeal, setIsCreatingDeal] = useState(false);
	const [createdDealInfo, setCreatedDealInfo] = useState(null);

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

	// Tracks if the form has been submitted and validated successfully
	const [formWasSubmitted, setFormWasSubmitted] = useState(false);
	const [dealOwnerId, setDealOwnerId] = useState(null);

	useEffect(() => {
		if (context?.crm?.contact?.email) {
			setEmailRecipient(context.crm.contact.email);
		}
		async function fetchOwner() {
			const { response } = await runServerless({
				name: "getOwner",
				parameters: { userId: context.user.id }
			});

			if (response.owner) {
				setDealOwnerId(response.owner.id);
			}
		}

		fetchOwner();
	}, [context]);

	const getFormStates = () => formValidationStates;
	const resetForm = () => {
		setBlockBookingType("");
		setEmailRecipient(context?.crm?.contact?.email || "");
		setIsLoading(null);
		setValidatedFormData(null);
		setIsFormSubmissionSuccessful(false);
		setFormWasSubmitted(false);
		setCreatedDealInfo(null);
		setFormValidationStates({
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
	};

	/** 
	* Creates a new deal in HubSpot.
	* @param {string} dealName - The name of the deal.
	* @param {string} dealType - The type of the deal.
	* @param {string} blockBookingType - The block booking type.
	* @param {string} innkeeperBookingNumbers - The innkeeper booking numbers.
	* @param {string} innkeeperBookingReference - The innkeeper booking reference.
	* @param {string} dealStage - The stage of the deal.
	* @param {string} emailRecipient - The email recipient for notifications.
	* @param {string} ticketId - The ticket ID associated with the deal.
	* @param {string} dealOwnerId - The owner ID for the deal.
	* @returns {Promise<void>}
	*/

	const createDeal = async (dealName, dealType, blockBookingType, innkeeperBookingNumbers, innkeeperBookingReference, dealStage, emailRecipient, ticketId, dealOwnerId) => {
		setIsCreatingDeal(true);
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
				ticketId,
				dealOwnerId

			}
		});
		setIsCreatingDeal(false);
		setCreatedDealInfo(response);

		if (response && response.details && response.details.properties && response.details.properties.dealname) {
			sendAlert({ message: `Deal created: ${response.details.properties.dealname}`, type: "success" });
			resetForm();
		} else {
			sendAlert({ message: "Deal was not created. Please try again or check your input.", type: "danger" });
		}
	};

	/**
	 * Handles the click event for booking validation.
	 * @param {*} bookingDisplays - The booking displays to validate.
	 * @param {*} bookingReference - The booking reference to validate.
	 */

	const handleClick = async (bookingDisplays, bookingReference) => {
		setIsLoading(true);
		const { response } = await runServerless({ name: "bookingValidation", parameters: { bookingDisplays, bookingReference } });

		if (blockBookingType === "tour") {
			if (response.hasOwnProperty("Booking IDs") && response["Booking IDs"].length > 0) {
				sendAlert({ message: `Booking IDs: ${response["Booking IDs"].length} bookings found`, type: "success" });
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
			const filteredObject = Object.fromEntries(
				Object.entries(response).filter(([key, value]) => value.isValid === false)
			);
			if (Object.keys(filteredObject).length) {
				let errorMessage = "";
				Object.entries(filteredObject).forEach(([key, value], index) => {
					if (!value.isValid) {
						sendAlert({ message: `Error in booking number ${index} ${key}: ${value.message}`, type: "danger" });
						errorMessage += index > 0 ? ", " + value.message : value.message;
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

	const dealTypeOptions = [
		{ label: "New Business", value: "newbusiness" },
		{ label: "Existing Business", value: "existingbusiness" },
	];

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
	 * Renders the input field for the booking reference.
	 * @returns {JSX.Element} - The input field for the booking reference.
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
						const isValid = value.trim().length > 0;
						setFormValidationStates((prevStates) => ({
							...prevStates,
							innkeeperBookingReference: {
								...prevStates.innkeeperBookingReference,
								isValid: isValid,
							},
							...(blockBookingType === "tour" && { innkeeperBookingNumbers: { ...prevStates.innkeeperBookingNumbers, isValid: true } }),
						}));
						// Reset formWasSubmitted and validatedFormData on input change
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
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
						// Reset formWasSubmitted and validatedFormData on input change
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
					}}
				/>
			);
		}
	}


	/**
	 * Checks if the form has any validation errors.
	 * @returns {boolean} - True if there are validation errors, false otherwise.
	 */
	const hasFormError = Object.values(formValidationStates).some(field => field.required && !field.isValid);

	return (
		<>
			<Form
				onSubmit={(event) => {
					const bookingDisplays = event.targetValue["innkeeper-booking-numbers"];
					const bookingReference = event.targetValue["innkeeper-booking-reference"];
					const dealName = event.targetValue["deal-name"];
					const dealType = event.targetValue["deal-type"];
					const blockBookingType = event.targetValue["block-booking-type"];
					const dealStage = event.targetValue["deal-stage"];
					const emailRecipient = event.targetValue["block-booking-email-recipient"];
					const description = event.targetValue["description"];

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
								emailRecipient,
								ticketId,
								dealOwnerId,
								description,
							});
							setFormWasSubmitted(true);
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
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
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
						setFormValidationStates((prevStates) => ({
							...prevStates,
							dealType: {
								...prevStates.dealType,
								isValid: isValid,
							},
						}));
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
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
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
					}}
				/>
				{bookingReferenceInput()}
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
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
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
					value={emailRecipient}
					onChange={(value) => {
						const pattern = formValidationStates.emailRecipient.pattern;
						const isValid = pattern.test(value) || value.trim().length === 0;
						setEmailRecipient(value);
						setFormValidationStates((prevStates) => ({
							...prevStates,
							emailRecipient: {
								...prevStates.emailRecipient,
								isValid: isValid,
							},
						}));
						setFormWasSubmitted(false);
						setValidatedFormData(null);
						setIsFormSubmissionSuccessful(false);
					}}
				/>
				<LoadingButton
					variant="primary"
					type="submit"
					loading={isLoading}
				>
					Validate bookings
				</LoadingButton>
				{formWasSubmitted && isFormSubmissionSuccessful && validatedFormData && !isLoading && !hasFormError && (
					<LoadingButton
						variant="secondary"
						disabled={!validatedFormData}
						loading={isCreatingDeal}
						onClick={async () => {
							if (validatedFormData) {
								await createDeal(
									validatedFormData.dealName,
									validatedFormData.dealType,
									validatedFormData.blockBookingType,
									validatedFormData.innkeeperBookingNumbers,
									validatedFormData.innkeeperBookingReference,
									validatedFormData.dealStage,
									validatedFormData.emailRecipient,
									ticketId,
									validatedFormData.dealOwnerId,
								);
							} else {
								sendAlert({ message: "Please submit the form first", type: "danger" });
							}
						}}
					>
						Create deal
					</LoadingButton>
				)}

			</Form>
		</>
	);
};

