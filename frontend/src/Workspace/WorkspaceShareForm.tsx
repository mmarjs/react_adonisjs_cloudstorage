import React, { useState, useEffect, useRef, useContext } from 'react'

/** Data */
import { useSelector } from 'react-redux'
import { StatusContext } from 'App/StatusProvider'
import { useMutation, useQueryClient } from 'react-query'
import { AppState } from 'App/reducers'

/** Material UI */
import makeStyles from '@material-ui/core/styles/makeStyles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormGroup from '@material-ui/core/FormGroup'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import NavigateNextIcon from '@material-ui/icons/NavigateNext'
import FormControl from '@material-ui/core/FormControl'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { FormLabel } from '@material-ui/core'
import IconButton from '@material-ui/core/IconButton'
import Visibility from '@material-ui/icons/Visibility'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import Button from '@material-ui/core/Button'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuList from '@material-ui/core/MenuList'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import Tooltip from '@material-ui/core/Tooltip'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import CircularProgress from '@material-ui/core/CircularProgress'

/** UI */
import { ReactComponent as LinkcopyIcon } from 'Image/icon_copy_link.svg'
import { ReactComponent as RefreshIcon } from 'Image/icon_refresh.svg'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'

/** Helpers */
import dayjs from 'dayjs'
import { useIsMounted, isFieldError, useAxios } from 'Lib'
import {
  WorkspaceShareFormProps,
  CreateShareLinkBody,
  ShareResourceType,
  ShareLinkType,
  ShareResourceItem,
  QueryKey,
} from 'types'

import generator from 'generate-password'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { getExpiresDate } from './common'
import { ShareDataItem } from './types'
import { WorkspaceGridContext, Store } from 'Workspace'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 5,
  },
  shareForm: {
    padding: '10px',
  },
  shareFormTextField: {
    'width': '80%',
    '& .MuiFormHelperText-contained': {
      position: 'absolute',
      bottom: '-16px',
    },
  },
  breadText: {
    fontSize: '0.8rem',
  },
  breadcrumbs: {
    margin: 0,
    paddingLeft: '10px',
  },
  formControlLabel: {
    margin: 0,
    width: '100%',
  },
  expirationSelect: {
    'width': '100%',
    '& legend': {
      width: 0,
    },
  },
  expirationTime: {
    float: 'right',
    width: '95%',
  },
  expiresTime: {
    width: '95%',
  },
  groupWrapper: {
    paddingLeft: '5px',
  },
  passwordLabel: {
    background: '#fff',
  },
  passwordForm: {
    width: '100%',
  },
  passwordRefreshIcon: {
    fill: '#5FB158',
    width: '20px',
  },
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex',
    padding: '0 24px',
    bottom: '10px',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#5FB158',
  },
  LinkCopyIcon: {
    width: '20px',
    marginLeft: '10px',
  },
  copyLinkGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  saveButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  popperMenu: {
    zIndex: 999,
  },
  saveButton: {
    'width': 'auto',
    'backgroundColor': '#4472C4',
    'height': '30px',
    'paddingLeft': '15px',
    'borderRadius': '20px',
    'textTransform': 'capitalize',
    '&:hover': {
      'color': '#000',
      '& .MuiCircularProgress-root': {
        color: '#000000',
        marginLeft: 10,
      },
    },
  },
  titleellipsis: {
    paddingTop: '5px',
  },
  passwordFormGroup: {
    'margin': 0,
    'position': 'relative',
    '& .MuiFormHelperText-contained': {
      position: 'absolute',
      bottom: '-16px',
    },
  },
  showPasswordIcon: {
    position: 'absolute',
    width: '50px',
    right: '5px',
    top: '-3px',
  },
  loader: {
    color: '#ffffff',
    marginLeft: 10,
  },
}))

export function WorkspaceShareForm(props: WorkspaceShareFormProps) {
  const {
    formType,
    resourceData,
    identifier,
    setResetLink,
    closeShareForm,
    openErrorMessage,
  } = props
  const classes = useStyles()
  const { showStatus } = useContext(StatusContext)
  const axios = useAxios()
  const { setSafely } = useIsMounted()
  const queryClient = useQueryClient()
  const subBreadcrumb = useSelector((state: AppState) => state.workspaceData.subBreadcrumb)
  const [showPassword, setShowPassword] = useState<boolean>(true)
  const [expiration, setExpiration] = useState<number>(0)
  const randomPassword = generator.generate({
    length: 8,
  })
  const [password, setPassword] = useState<string>(randomPassword)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [breadcrumbData, setBreadcrumData] = useState<any>([])
  const [isLoader, setIsLoader] = useState<boolean>(false)
  const { folderPath } = useContext(WorkspaceGridContext) as Store

  useEffect(() => {
    if (subBreadcrumb) {
      setBreadcrumData(subBreadcrumb)
    } else {
      setBreadcrumData([])
    }
  }, [subBreadcrumb, setBreadcrumData])

  const shareURL =
    process.env.NODE_ENV === 'production' ? process.env.REACT_APP_URL : 'http://localhost:3000'

  const changeExpiration = (event: React.ChangeEvent<{ value: unknown }>) => {
    setExpiration(event.target.value as number)
  }

  const handleClickShowPassword = () => {
    setSafely(setShowPassword, !showPassword)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }
    setOpen(false)
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const prevOpen = useRef(open)

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }
    prevOpen.current = open
  }, [open])

  const schema = yup.object().shape({
    email: yup.string().required('A email is required').max(80),
    subject: yup.string().required('A subject is required'),
    password: yup.string().required('A password is required').min(8),
    message: yup.string().max(240),
  })

  const { register, control, setValue, handleSubmit, errors } = useForm<any>({
    resolver: yupResolver(schema),
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    mode: 'onChange',
  })

  const createShareLink = async (params: object): Promise<void> => {
    setSafely(setIsLoader, true)
    let data: any = []
    data = await axios.post('/share/create_link', params)
    return data
  }

  const mutationCreateShareLink = useMutation(createShareLink, {
    onSuccess: (data) => {
      setSafely(setIsLoader, false)
      closeShareForm()
      queryClient.refetchQueries([QueryKey.workspaceShareLink])
      showStatus('A file was successfully shared!')
    },
    onError: (error) => {
      setSafely(setIsLoader, false)
      const err: Error = error as Error
      switch (err['error']) {
        case 'share-link-already-exists':
          openErrorMessage(
            'We could not create the share link because it already exists. Please refresh the url and try again'
          )
          break
        case 'duplicate-entry':
          openErrorMessage('That item already exists')
          break
        default:
          openErrorMessage('A file could not be shared, please try again')
          break
      }
    },
  })

  const onSubmit = (data: ShareDataItem) => {
    let resource_type: ShareResourceType = 'work_group_folders'
    let resourceLink_type: ShareLinkType = 'work_group'
    const expiresDateParam: string | undefined = getExpiresDate(data)
    let itemData: ShareResourceItem[] = []

    resourceData.map((ele: any, index: number) => {
      if (folderPath.charAt(0) === 'w') {
        if (ele.type === 'folder') {
          resource_type = 'work_group_folders'
        } else {
          resource_type = 'work_group_files'
        }
        resourceLink_type = 'work_group'
      } else {
        if (ele.type === 'folder') {
          resource_type = 'personal_folders'
        } else {
          resource_type = 'personal_files'
        }
        resourceLink_type = 'personal'
      }
      let temp_item: any = {}
      temp_item = {
        resource: resource_type,
        resourceId: ele.data_id,
      }
      itemData.push(temp_item)
      return ele
    })
    const params: CreateShareLinkBody = {
      email: data.email,
      password: data.password,
      identifier: identifier,
      subject: data.subject,
      message: data.message,
      expiresAt: expiresDateParam,
      shareType: formType,
      folderId: formType === 'download' ? resourceData[0].parent_id : resourceData[0].data_id,
      resource: resourceLink_type,
      canTrash: data.delete,
      canUpdatePassword: data.updatePassword,
      items: itemData,
    }
    mutationCreateShareLink.mutate(params)
  }

  const resetLink = () => {
    setResetLink()
    const randomPassword = generator.generate({
      length: 20,
    })
    setSafely(setPassword, randomPassword)
  }

  const handleSaveShareLink = () => {
    handleSubmit(onSubmit)()
  }

  return (
    <Grid container item justify="center" className={classes.root}>
      <Grid item sm={10} xs={12}>
        <form id="share-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container item xs={12}>
            <Grid item sm={6} xs={12} className={classes.shareForm}>
              <FormGroup>
                <TextField
                  id="email"
                  name="email"
                  inputRef={register}
                  type="text"
                  variant="outlined"
                  label="Recipient email(Required)"
                  size="small"
                  error={isFieldError(errors.email?.message)}
                  helperText={errors.email?.message}
                  className={classes.shareFormTextField}
                />
              </FormGroup>
              <FormGroup>
                <TextField
                  id="subject"
                  name="subject"
                  type="text"
                  inputRef={register}
                  variant="outlined"
                  label="Subject(Required)"
                  size="small"
                  error={isFieldError(errors.subject?.message)}
                  helperText={errors.subject?.message}
                  className={classes.shareFormTextField}
                />
              </FormGroup>
              <FormGroup>
                <TextField
                  id="message"
                  name="message"
                  type="text"
                  inputRef={register}
                  variant="outlined"
                  label="Message"
                  multiline
                  rows={4}
                  error={isFieldError(errors.message?.message)}
                  helperText={errors.message?.message}
                />
              </FormGroup>
              <Grid container item alignItems="center">
                <Typography className={classes.breadText}>Shared Folder:</Typography>
                <Breadcrumbs
                  maxItems={2}
                  separator={<NavigateNextIcon fontSize="small" />}
                  aria-label="breadcrumb"
                  className={classes.breadcrumbs}
                >
                  {folderPath.charAt(0) === 'w' && (
                    <Typography className={classes.breadText}>WorkGroup</Typography>
                  )}
                  {folderPath.charAt(0) === 'p' && (
                    <Typography className={classes.breadText}>Personal</Typography>
                  )}
                  {folderPath.charAt(0) === 'r' && (
                    <Typography className={classes.breadText}>Recycle Bin</Typography>
                  )}
                  {folderPath.charAt(0) === 's' && (
                    <Typography className={classes.breadText}>Share Management</Typography>
                  )}
                  {breadcrumbData?.map((ele: any, index: number) => {
                    return (
                      <Typography className={classes.breadText} id={ele.id} key={index}>
                        {ele.module?.length > 14
                          ? ele.module?.substring(0, 11)
                          : ele.module?.substring(0, 14)}
                        {ele.module?.length > 14 && (
                          <Tooltip
                            title={ele.module ? ele.module : ''}
                            arrow
                            placement="top"
                            disableHoverListener={false}
                          >
                            <MoreHorizIcon className={classes.titleellipsis} />
                          </Tooltip>
                        )}
                      </Typography>
                    )
                  })}
                </Breadcrumbs>
              </Grid>
            </Grid>
            <Grid item sm={6} xs={12} className={classes.shareForm}>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Expires on:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Controller
                      id="expires"
                      name="expires"
                      label="Expires"
                      control={control}
                      defaultValue={expiration}
                      render={({ onChange, ref }) => (
                        <FormControl
                          variant="outlined"
                          size="small"
                          className={classes.expirationSelect}
                        >
                          <Select
                            labelId="demo-simple-select-outlined-label"
                            id="demo-simple-select-outlined"
                            value={expiration}
                            onChange={(event) => {
                              changeExpiration(event)
                              setValue('expires', event.target.value)
                            }}
                          >
                            <MenuItem value={0}>Never</MenuItem>
                            <MenuItem value={1}>3 days</MenuItem>
                            <MenuItem value={2}>7 days</MenuItem>
                            <MenuItem value={3}>30 days</MenuItem>
                            <MenuItem value={4}>Custom</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                </Grid>
              </FormGroup>
              {expiration === 4 && (
                <FormGroup>
                  <Grid container alignItems="center">
                    <Grid item sm={3} xs={12}>
                      <FormLabel>Expires on:</FormLabel>
                    </Grid>
                    <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                      <Grid item xs={6}>
                        <TextField
                          id="date"
                          name="date"
                          type="date"
                          inputRef={register}
                          defaultValue={dayjs(new Date()).format('YYYY-MM-DD')}
                          variant="outlined"
                          size="small"
                          className={classes.expiresTime}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          id="time"
                          name="time"
                          type="time"
                          inputRef={register}
                          defaultValue={dayjs(new Date()).format('HH:mm')}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          inputProps={{
                            step: 300, // 5 min
                          }}
                          variant="outlined"
                          size="small"
                          className={classes.expirationTime}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </FormGroup>
              )}
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Share link:</FormLabel>
                  </Grid>
                  <Grid container item sm={9} xs={12} className={classes.groupWrapper}>
                    <Typography>{shareURL + '/share/' + identifier}</Typography>
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup>
                <Grid container alignItems="center">
                  <Grid item sm={3} xs={12}>
                    <FormLabel>Password:</FormLabel>
                  </Grid>
                  <Grid
                    container
                    item
                    sm={9}
                    xs={12}
                    alignItems="center"
                    className={classes.groupWrapper}
                  >
                    <Grid item sm={11}>
                      <FormGroup className={classes.passwordFormGroup}>
                        <TextField
                          id="password"
                          name="password"
                          inputRef={register}
                          type={showPassword ? 'text' : 'password'}
                          defaultValue={password}
                          variant="outlined"
                          size="small"
                          error={isFieldError(errors.password?.message)}
                          helperText={errors.password?.message}
                        />
                        <IconButton
                          className={classes.showPasswordIcon}
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </FormGroup>
                    </Grid>
                    <Grid item sm={1}>
                      <IconButton aria-label="password refresh" onClick={resetLink}>
                        <RefreshIcon className={classes.passwordRefreshIcon} />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              </FormGroup>
              <FormGroup className={classes.copyLinkGroup}>
                <CopyToClipboard
                  text={`URL: ${shareURL + '/share/' + identifier}
Password: ${password}`}
                  onCopy={() => showStatus('A link copied to clipboard.')}
                >
                  <Typography variant="subtitle1" className={classes.wrapIcon}>
                    Copy <LinkcopyIcon className={classes.LinkCopyIcon} />
                  </Typography>
                </CopyToClipboard>
              </FormGroup>
              {formType === 'share' && (
                <>
                  <FormLabel component="legend">User Options:</FormLabel>
                  <FormGroup aria-label="position" row>
                    <Controller
                      id="UpdatePassword"
                      name="updatePassword"
                      label="UpdatePassword"
                      defaultValue={false}
                      control={control}
                      render={({ onChange, ref }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              onChange={(event) => {
                                setValue('updatePassword', event.target.checked)
                              }}
                            />
                          }
                          label="Update Password:"
                        />
                      )}
                    />
                    <Controller
                      id="delete"
                      name="delete"
                      defaultValue={false}
                      control={control}
                      render={({ onChange, ref }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              onChange={(event) => {
                                setValue('delete', event.target.checked)
                              }}
                            />
                          }
                          label="Delete:"
                        />
                      )}
                    />
                  </FormGroup>
                </>
              )}
              <FormGroup className={classes.saveButtonGroup}>
                <Button
                  ref={anchorRef}
                  aria-controls={open ? 'menu-list-grow' : ''}
                  aria-haspopup="true"
                  className={classes.saveButton}
                  size="small"
                  onClick={handleSaveShareLink}
                  onMouseLeave={(e) => {
                    setOpen((prevOpen) => !prevOpen)
                  }}
                  onMouseEnter={(e) => {
                    setOpen((prevOpen) => !prevOpen)
                  }}
                >
                  Save & send
                  {isLoader ? (
                    <CircularProgress size={20} className={classes.loader} />
                  ) : (
                    <ArrowDropDownIcon />
                  )}
                </Button>
                <Popper
                  open={open}
                  anchorEl={anchorRef.current}
                  role={''}
                  transition
                  disablePortal
                  className={classes.popperMenu}
                >
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList
                            autoFocusItem={open}
                            id="menu-list-grow"
                            onKeyDown={handleListKeyDown}
                            onMouseLeave={(e) => {
                              setOpen((prevOpen) => !prevOpen)
                            }}
                            onMouseEnter={(e) => {
                              setOpen((prevOpen) => !prevOpen)
                            }}
                          >
                            <MenuItem onClick={handleSaveShareLink}>Save & Close</MenuItem>
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
              </FormGroup>
              {/* <FormGroup>
                <CircularProgress size={60} color="primary" />
              </FormGroup> */}
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  )
}
